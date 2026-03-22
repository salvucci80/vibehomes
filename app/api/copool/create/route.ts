import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/client'
import { nanoid } from 'nanoid'
import { z } from 'zod'

const CreateCopoolSchema = z.object({
  name: z.string().min(2).max(80),
  targetCity: z.string().optional(),
  targetBudget: z.number().int().positive().optional(),  // total in cents
  maxMembers: z.number().int().min(2).max(10).default(6),
  propertyId: z.string().uuid().optional(),
})

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, targetCity, targetBudget, maxMembers, propertyId } = CreateCopoolSchema.parse(body)

    // Generate a human-readable invite code
    const inviteCode = nanoid(8).toUpperCase()

    // Create a Stripe Connect Express account for this pool
    // This account will hold escrowed deposits until legal sign-off
    const stripeAccount = await stripe.accounts.create({
      type: 'express',
      country: 'NL',
      email: user.email,
      capabilities: {
        transfers: { requested: true },
      },
      metadata: {
        vibehome_pool_invite_code: inviteCode,
        creator_id: user.id,
      },
    })

    // Create the pool
    const { data: pool, error } = await supabase
      .from('copool_groups')
      .insert({
        creator_id: user.id,
        name,
        target_city: targetCity,
        target_budget: targetBudget,
        max_members: maxMembers,
        property_id: propertyId ?? null,
        invite_code: inviteCode,
        stripe_acct: stripeAccount.id,
        legal_status: 'forming',
      })
      .select()
      .single()

    if (error) throw error

    // Auto-join creator as first member
    await supabase.from('copool_members').insert({
      pool_id: pool.id,
      user_id: user.id,
      share_pct: 100 / maxMembers,  // Equal split by default, adjustable later
      contribution: targetBudget ? Math.round(targetBudget / maxMembers) : 0,
      kyc_cleared: false,
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://vibehome.co'

    return NextResponse.json({
      poolId: pool.id,
      inviteCode,
      inviteUrl: `${appUrl}/join/${inviteCode}`,
    })
  } catch (error) {
    console.error('[copool/create]', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
