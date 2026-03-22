import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { HostDashboard } from '@/components/host/host-dashboard'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Host Dashboard — VibeHome',
}

export default async function HostPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/host')

  // Fetch host's properties + bookings summary
  const [{ data: properties }, { data: bookings }] = await Promise.all([
    supabase
      .from('properties')
      .select('*')
      .eq('host_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('bookings')
      .select('*, property:properties(title)')
      .eq('properties.host_id', user.id)
      .eq('status', 'confirmed')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  // Revenue stats
  const totalRevenue = bookings?.reduce((sum, b) => sum + (b.amount_cents - b.fee_cents), 0) ?? 0
  const thisMonthRevenue = bookings
    ?.filter(b => new Date(b.created_at).getMonth() === new Date().getMonth())
    .reduce((sum, b) => sum + (b.amount_cents - b.fee_cents), 0) ?? 0

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="font-syne font-bold text-2xl text-vibe-text">Host Dashboard</h1>
        <p className="text-sm text-vibe-muted mt-1">Manage your listings and track earnings</p>
      </div>
      <HostDashboard
        properties={properties ?? []}
        recentBookings={bookings ?? []}
        totalRevenue={totalRevenue}
        thisMonthRevenue={thisMonthRevenue}
        userId={user.id}
      />
    </div>
  )
}
