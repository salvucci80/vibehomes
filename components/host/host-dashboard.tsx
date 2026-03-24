'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { Plus, TrendingUp, Home, Calendar, Zap } from 'lucide-react'
import type { CopoolGroup } from '../../types'

interface HostDashboardProps {
  properties: Property[]
  recentBookings: Booking[]
  totalRevenue: number
  thisMonthRevenue: number
  userId: string
}

export function HostDashboard({
  properties, recentBookings, totalRevenue, thisMonthRevenue, userId
}: HostDashboardProps) {

  const activeListings = properties.filter(p => p.status === 'active').length
  // Estimate what Airbnb would have charged at 15% vs our 2.5%
  const airbnbFees   = totalRevenue * (0.15 / 0.975)
  const vibehomeFees = totalRevenue * (0.025 / 0.975)
  const savedVsAirbnb = airbnbFees - vibehomeFees

  return (
    <div className="flex flex-col gap-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={<Home size={16} />} label="Active listings" value={activeListings.toString()} color="text-vibe-teal" />
        <StatCard icon={<TrendingUp size={16} />} label="This month" value={formatCurrency(thisMonthRevenue)} color="text-vibe-green" />
        <StatCard icon={<Calendar size={16} />} label="Total earned" value={formatCurrency(totalRevenue)} color="text-vibe-orange" />
        <StatCard icon={<Zap size={16} />} label="Saved vs Airbnb" value={formatCurrency(savedVsAirbnb)} color="text-vibe-yellow" />
      </div>

      {/* Savings callout */}
      {savedVsAirbnb > 0 && (
        <div className="bg-vibe-green/10 border border-vibe-green/20 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="font-syne font-bold text-vibe-green">
              You've saved {formatCurrency(savedVsAirbnb)} in fees
            </p>
            <p className="text-xs text-vibe-muted mt-0.5">
              VibeHome charges 2.5% vs Airbnb's ~15% host fee
            </p>
          </div>
          <button
            onClick={() => {
              const text = `I save ${formatCurrency(savedVsAirbnb)} in fees using @VibeHome instead of Airbnb! 🏠✨ vibehome.co`
              navigator.clipboard.writeText(text)
            }}
            className="text-xs bg-vibe-green/20 text-vibe-green px-3 py-1.5 rounded-lg hover:bg-vibe-green/30 transition-all"
          >
            Share savings 📣
          </button>
        </div>
      )}

      {/* Properties */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-syne font-bold text-vibe-text">Your listings</h2>
          <Link href="/host/listings/new">
            <Button size="sm">
              <Plus size={14} /> Add listing
            </Button>
          </Link>
        </div>
        {properties.length === 0 ? (
          <Card>
            <CardContent className="text-center py-10 text-vibe-muted">
              <Home size={32} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No listings yet</p>
              <p className="text-sm mt-1 mb-4">List your property in minutes</p>
              <Link href="/host/listings/new">
                <Button size="sm"><Plus size={14} /> Create first listing</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {properties.map(p => (
              <Card key={p.id} className="hover:border-white/14 transition-all">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-vibe-surface border border-vibe-border flex items-center justify-center text-2xl flex-shrink-0">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt="" className="w-full h-full object-cover rounded-lg" />
                    ) : '🏠'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-syne font-bold text-vibe-text truncate">{p.title}</p>
                    <p className="text-xs text-vibe-muted">{p.neighborhood ?? p.city}</p>
                    <p className="text-sm text-vibe-teal font-mono font-medium mt-1">{formatCurrency(p.price_month)}/mo</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      p.status === 'active' ? 'bg-vibe-green/15 text-vibe-green' : 'bg-white/5 text-vibe-muted'
                    }`}>{p.status}</span>
                    <Link href={`/host/listings/${p.id}/edit`}>
                      <Button size="sm" variant="ghost" className="text-xs">Edit</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent bookings */}
      {recentBookings.length > 0 && (
        <div>
          <h2 className="font-syne font-bold text-vibe-text mb-3">Recent bookings</h2>
          <div className="flex flex-col gap-2">
            {recentBookings.map(b => (
              <Card key={b.id}>
                <CardContent className="p-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-vibe-text">{b.property?.title}</p>
                    <p className="text-xs text-vibe-muted">{b.start_date} → {b.end_date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-vibe-green text-sm">{formatCurrency(b.amount_cents - b.fee_cents)}</p>
                    <p className="text-xs text-vibe-muted">you receive</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: string; color: string
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className={`${color} mb-2`}>{icon}</div>
        <div className={`font-syne font-bold text-xl ${color}`}>{value}</div>
        <div className="text-xs text-vibe-muted mt-0.5">{label}</div>
      </CardContent>
    </Card>
  )
}
