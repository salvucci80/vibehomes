import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { Users, MapPin } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default async function JoinPoolPage({ params }: { params: { code: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Look up the pool by invite code
  const { data: pool } = await supabase
    .from('copool_groups')
    .select(`
      *,
      creator:users!creator_id(full_name, avatar_url),
      members:copool_members(user_id)
    `)
    .eq('invite_code', params.code.toUpperCase())
    .single()

  if (!pool) redirect('/copool')

  const memberCount = pool.members?.length ?? 0
  const spotsLeft   = pool.max_members - memberCount
  const isFull      = spotsLeft <= 0
  const isMember    = pool.members?.some((m: any) => m.user_id === user?.id)

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-vibe-bg">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <span className="font-mono text-xs text-vibe-teal tracking-widest uppercase">You're invited</span>
          <h1 className="font-syne font-bold text-3xl text-vibe-text mt-2">{pool.name}</h1>
          <p className="text-vibe-muted mt-1">Co-ownership pool · {memberCount}/{pool.max_members} members</p>
        </div>

        <Card className="mb-4">
          <CardContent className="p-5">
            {/* Pool details */}
            <div className="flex flex-col gap-3 mb-4">
              {pool.target_city && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin size={14} className="text-vibe-muted" />
                  <span className="text-vibe-text">{pool.target_city}</span>
                </div>
              )}
              {pool.target_budget && (
                <div className="flex items-center gap-2 text-sm">
                  <Users size={14} className="text-vibe-muted" />
                  <span>
                    <span className="text-vibe-text font-medium">{formatCurrency(pool.target_budget)}</span>
                    <span className="text-vibe-muted"> target · </span>
                    <span className="text-vibe-teal font-medium">{formatCurrency(pool.target_budget / pool.max_members)}/person</span>
                  </span>
                </div>
              )}
            </div>

            {/* Member spots */}
            <div className="flex gap-1.5 mb-5">
              {Array.from({ length: pool.max_members }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-2 rounded-full ${
                    i < memberCount ? 'bg-vibe-teal' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>

            {isFull ? (
              <div className="text-center py-3 text-vibe-muted">
                <p className="font-medium text-red-400">This pool is full</p>
                <p className="text-sm mt-1">Check other open pools</p>
              </div>
            ) : isMember ? (
              <div className="text-center">
                <p className="text-vibe-green font-medium mb-3">You're already in this pool!</p>
                <Link href={`/copool/${pool.id}`}>
                  <button className="w-full bg-vibe-teal text-vibe-bg font-bold py-2.5 rounded-xl text-sm">
                    View pool
                  </button>
                </Link>
              </div>
            ) : !user ? (
              <div className="text-center">
                <p className="text-vibe-muted text-sm mb-3">Sign up to join this pool</p>
                <Link href={`/signup?redirect=/join/${params.code}`}>
                  <button className="w-full bg-vibe-orange text-white font-bold py-2.5 rounded-xl text-sm">
                    Create account to join →
                  </button>
                </Link>
              </div>
            ) : (
              <Link href={`/copool/${pool.id}/join`}>
                <button className="w-full bg-vibe-orange text-white font-bold py-2.5 rounded-xl text-sm">
                  Join pool · {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left
                </button>
              </Link>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-vibe-muted">
          Created by {pool.creator?.full_name ?? 'a VibeHome member'} ·{' '}
          <Link href="/copool" className="text-vibe-teal hover:underline">Browse all pools</Link>
        </p>
      </div>
    </div>
  )
}
