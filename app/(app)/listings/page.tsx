import { createClient } from '@/lib/supabase/server'
import { PropertyGrid } from '@/components/listings/property-grid'
import { ListingsFilters } from '@/components/listings/listings-filters'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Listings — VibeHome',
  description: 'Direct property listings with no middleman fees.',
}

interface SearchParams {
  city?: string
  neighborhood?: string
  type?: string
  min?: string
  max?: string
  co_own?: string
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = createClient()

  let query = supabase
    .from('properties')
    .select('*, host:users!host_id(id, full_name, avatar_url)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(24)

  if (searchParams.city)    query = query.ilike('city', `%${searchParams.city}%`)
  if (searchParams.neighborhood) query = query.ilike('neighborhood', `%${searchParams.neighborhood}%`)
  if (searchParams.type)    query = query.eq('type', searchParams.type)
  if (searchParams.min)     query = query.gte('price_month', parseInt(searchParams.min) * 100)
  if (searchParams.max)     query = query.lte('price_month', parseInt(searchParams.max) * 100)
  if (searchParams.co_own === 'true') query = query.eq('co_own_ok', true)

  const { data: properties } = await query

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="font-syne font-bold text-2xl text-vibe-text">Listings</h1>
        <p className="text-sm text-vibe-muted mt-1">
          Direct from hosts — save up to 12.5% vs Airbnb
        </p>
      </div>
      <ListingsFilters />
      <PropertyGrid properties={properties ?? []} />
    </div>
  )
}
