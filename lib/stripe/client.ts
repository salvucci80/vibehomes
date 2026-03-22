import Stripe from 'stripe'

// Server-side Stripe client
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
})

// Fee configuration
export const VIBEHOME_FEE_PERCENT = 0.025  // 2.5%
export const COPOOL_FACILITATION_PERCENT = 0.01  // 1%

export function calculateFee(amountCents: number): number {
  return Math.round(amountCents * VIBEHOME_FEE_PERCENT)
}

export function calculateCopoolFee(propertyValueCents: number): number {
  return Math.round(propertyValueCents * COPOOL_FACILITATION_PERCENT)
}
