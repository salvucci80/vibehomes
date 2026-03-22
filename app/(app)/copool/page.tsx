import { createClient } from '@/lib/supabase/server'
import { CopoolList } from '@/components/copool/copool-list'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Co-Pool — VibeHome',
  description: 'Pool resources with others to co-own property.',
}

export default async function CopoolPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch active pools the user is part of (or all public forming pools)
  const { data: pools } = await supabase
    .from('copool_groups')
    .select(`
      *,
      creator:users!creator_id(id, full_name, avatar_url),
      members:copool_members(
        user_id, share_pct, contribution, kyc_cleared,
        user:users(id, full_name, avatar_url)
      )
    `)
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-syne font-bold text-2xl text-vibe-text">Co-Pool</h1>
          <p className="text-sm text-vibe-muted mt-1">
            Pool resources to co-own property together
          </p>
        </div>
        {user && (
          <Link href="/copool/create">
            <Button size="sm">
              <Plus size={14} />
              Start a pool
            </Button>
          </Link>
        )}
      </div>

      {/* Calculator teaser */}
      <div className="bg-gradient-to-r from-vibe-teal/10 to-vibe-purple/10 border border-vibe-teal/20 rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="font-syne font-bold text-vibe-teal">
              Could you afford to co-own?
            </p>
            <p className="text-sm text-vibe-muted mt-0.5">
              6 people at €800/mo each = €1.1M buying power
            </p>
          </div>
          <Link href="/copool/calculator">
            <Button size="sm" variant="secondary">
              Try calculator →
            </Button>
          </Link>
        </div>
      </div>

      {/* Pool list */}
      <CopoolList pools={pools ?? []} currentUserId={user?.id} />
    </div>
  )
}
