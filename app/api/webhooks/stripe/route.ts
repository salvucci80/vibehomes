import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const resendApiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.FROM_EMAIL

  if (
    !stripeSecretKey ||
    !stripeWebhookSecret ||
    !supabaseUrl ||
    !supabaseServiceRoleKey ||
    !resendApiKey ||
    !fromEmail
  ) {
    console.error('Missing required environment variables for Stripe webhook route')
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2023-10-16',
  })

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)
  const resend = new Resend(resendApiKey)

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret)
  } catch (err) {
    console.error('[webhook] Signature verification failed', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent

        const { data: booking } = await supabaseAdmin
          .from('bookings')
          .update({ status: 'confirmed' })
          .eq('payment_intent_id', pi.id)
          .select('*, property:properties(title, city), renter:users!renter_id(email, full_name)')
          .single()

        if (booking) {
          await resend.emails.send({
            from: fromEmail,
            to: booking.renter.email,
            subject: `Booking confirmed — ${booking.property.title}`,
            html: `<p>Hi ${booking.renter.full_name ?? 'there'},</p>
                   <p>Your booking for <strong>${booking.property.title}</strong> in ${booking.property.city} is confirmed!</p>
                   <p>Check-in: ${booking.start_date} | Check-out: ${booking.end_date}</p>`,
          })
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent
        await supabaseAdmin
          .from('bookings')
          .update({ status: 'cancelled' })
          .eq('payment_intent_id', pi.id)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription

        await supabaseAdmin
          .from('users')
          .update({ sub_tier: 'pro' })
          .eq('stripe_id', sub.customer as string)

        await supabaseAdmin.from('subscriptions').upsert(
          {
            stripe_subscription_id: sub.id,
            stripe_customer_id: sub.customer as string,
            tier: resolveTier(sub),
            status: sub.status,
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          },
          { onConflict: 'stripe_subscription_id' }
        )
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription

        await supabaseAdmin
          .from('users')
          .update({ sub_tier: 'free' })
          .eq('stripe_id', sub.customer as string)

        await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', sub.id)
        break
      }

      case 'account.updated': {
        const account = event.data.object as Stripe.Account
        if (account.charges_enabled && account.payouts_enabled) {
          const userId = account.metadata?.vibehome_user_id
          if (userId) {
            await supabaseAdmin
              .from('users')
              .update({ stripe_id: account.id })
              .eq('id', userId)
          }
        }
        break
      }

      default:
        console.log(`[webhook] Unhandled event: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[webhook] Handler error', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

function resolveTier(sub: Stripe.Subscription): string {
  const priceId = sub.items.data[0]?.price.id
  if (
    priceId === process.env.STRIPE_PRICE_HOST_PRO_MONTHLY ||
    priceId === process.env.STRIPE_PRICE_HOST_PRO_ANNUAL
  ) return 'host_pro'
  if (priceId === process.env.STRIPE_PRICE_RENTER_PRO_MONTHLY) return 'renter_pro'
  if (priceId === process.env.STRIPE_PRICE_COPOOL_PREMIUM) return 'pool_premium'
  return 'host_pro'
}