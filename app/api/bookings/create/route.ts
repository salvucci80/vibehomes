import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, calculateFee } from '@/lib/stripe/client'
import { z } from 'zod'

const CreateBookingSchema = z.object({
  propertyId: z.string().uuid(),
  startDate: z.string(),
  endDate: z.string(),
})

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { propertyId, startDate, endDate } = CreateBookingSchema.parse(body)

    // Fetch property + host's Stripe Connect ID
    const { data: property, error: propError } = await supabase
      .from('properties')
      .select('*, host:users!host_id(id, stripe_id)')
      .eq('id', propertyId)
      .eq('status', 'active')
      .single()

    if (propError || !property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    if (!property.host?.stripe_id) {
      return NextResponse.json({ error: 'Host has not connected Stripe' }, { status: 400 })
    }

    // Calculate dates and amount
    const start = new Date(startDate)
    const end = new Date(endDate)
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    const dailyRate = Math.round(property.price_month / 30)
    const subtotal = dailyRate * nights
    const fee = calculateFee(subtotal)

    // Create Stripe Payment Intent with Connect fee split
    const paymentIntent = await stripe.paymentIntents.create({
      amount: subtotal,
      currency: 'usd',
      application_fee_amount: fee,            // VibeHome takes 2.5%
      transfer_data: {
        destination: property.host.stripe_id, // Host gets the rest
      },
      metadata: {
        propertyId,
        renterId: user.id,
        startDate,
        endDate,
        nights: nights.toString(),
      },
    })

    // Save pending booking record
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        property_id: propertyId,
        renter_id: user.id,
        payment_intent_id: paymentIntent.id,
        amount_cents: subtotal,
        fee_cents: fee,
        status: 'pending',
        start_date: startDate,
        end_date: endDate,
      })
      .select()
      .single()

    if (bookingError) throw bookingError

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      bookingId: booking.id,
    })
  } catch (error) {
    console.error('[bookings/create]', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
