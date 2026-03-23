// ─── Core Domain Types ────────────────────────────────────────────────────

export type UserRole = 'host' | 'renter' | 'co_owner'
export type SubTier  = 'free' | 'pro'
export type KycStatus = 'pending' | 'verified' | 'failed'
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'
export type LegalStatus = 'forming' | 'funded' | 'signed' | 'active' | 'dissolved'

export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole | null
  stripe_id: string | null
  sub_tier: SubTier
  budget_min: number | null
  budget_max: number | null
  kyc_status: KycStatus
  created_at: string
}

export interface Property {
  id: string
  host_id: string
  title: string
  description: string | null
  city: string | null
  neighborhood: string | null
  lat: number | null
  lng: number | null
  price_month: number        // in cents
  type: 'apartment' | 'house' | 'room' | 'co-living' | null
  co_own_ok: boolean
  total_shares: number | null
  share_price: number | null // in cents
  images: string[]
  verified: boolean
  status: 'active' | 'inactive' | 'sold'
  created_at: string
  // joined
  host?: Pick<User, 'id' | 'full_name' | 'avatar_url'>
}

export interface VibeReview {
  id: string
  user_id: string
  neighborhood: string
  city: string
  lat: number
  lng: number
  noise_score: number      // 1-10
  light_score: number      // 1-10
  wifi_score: number       // 1-10
  community_score: number  // 1-10
  notes: string | null
  created_at: string
}

export interface CopoolGroup {
  id: string
  creator_id: string
  name: string
  target_city: string | null
  target_budget: number | null  // total pool budget in cents
  max_members: number
  property_id: string | null
  legal_status: LegalStatus
  invite_code: string
  stripe_acct: string | null
  agreement_url: string | null
  created_at: string
  // joined
  members?: CopoolMember[]
  property?: Property
  creator?: Pick<User, 'id' | 'full_name' | 'avatar_url'>
}

export interface CopoolMember {
  pool_id: string
  user_id: string
  share_pct: number   // e.g. 33.33
  contribution: number // monthly in cents
  kyc_cleared: boolean
  joined_at: string
  user?: Pick<User, 'id' | 'full_name' | 'avatar_url' | 'kyc_status'>
}

export interface Booking {
  id: string
  property_id: string
  renter_id: string
  payment_intent_id: string
  amount_cents: number
  fee_cents: number
  status: BookingStatus
  start_date: string
  end_date: string
  created_at: string
  property?: Property
  renter?: Pick<User, 'id' | 'full_name' | 'email'>
}

// ─── Neighbourhood Vibe Aggregate (computed) ─────────────────────────────

export interface NeighbourhoodVibe {
  neighborhood: string
  city: string
  lat: number
  lng: number
  review_count: number
  avg_noise: number
  avg_light: number
  avg_wifi: number
  avg_community: number
  overall_score: number  // weighted average
}

// ─── API Response Types ───────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
}

export interface CreateBookingResponse {
  clientSecret: string
  bookingId: string
}

export interface CreateCopoolResponse {
  poolId: string
  inviteUrl: string
}
