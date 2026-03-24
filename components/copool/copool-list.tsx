'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatPct } from '@/lib/utils'
import { Users, MapPin, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import type { CopoolGroup } from '../../types'

const STATUS_LABELS = {
  forming: { label: 'Forming', color: 'text-vibe-yellow bg-vibe-yellow/10' },
  funded:  { label: 'Funded',  color: 'text-vibe-teal  bg-vibe-teal/10'  },
  signed:  { label: 'Signed',  color: 'text-vibe-green bg-vibe-green/10' },
  active:  { label: 'Active',  color: 'text-vibe-green bg-vibe-green/10' },
  dissolved: { label: 'Dissolved', color: 'text-vibe-muted bg-white/5'   },
}

interface CopoolListProps {
  pools: CopoolGroup[]
  currentUserId?: string
}

export function CopoolList({ pools, currentUserId }: CopoolListProps) {
  if (pools.length === 0) {
    return (
      <div className="text-center py-16 text-vibe-muted">
        <Users size={40} className="mx-auto mb-3 opacity-30" />
        <p className="font-medium">No pools yet</p>
        <p className="text-sm mt-1">Be the first to start one!</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {pools.map((pool) => (
        <CopoolCard key={pool.id} pool={pool} currentUserId={currentUserId} />
      ))}
    </div>
  )
}

function CopoolCard({ pool, currentUserId }: { pool: CopoolGroup; currentUserId?: string }) {
  const [copied, setCopied] = useState(false)
  const status = STATUS_LABELS[pool.legal_status] ?? STATUS_LABELS.forming
  const memberCount = pool.members?.length ?? 0
  const isCreator = currentUserId === pool.creator_id
  const isMember = pool.members?.some(m => m.user_id === currentUserId)

  const copyInviteLink = async () => {
    const url = `${window.location.origin}/join/${pool.invite_code}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="hover:border-white/14 transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-syne font-bold text-vibe-text truncate">{pool.name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-medium ${status.color}`}>
                {status.label}
              </span>
            </div>
            {pool.target_city && (
              <p className="text-xs text-vibe-muted flex items-center gap-1">
                <MapPin size={11} /> {pool.target_city}
              </p>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <div className="font-mono font-bold text-vibe-teal text-lg">
              {memberCount}/{pool.max_members}
            </div>
            <div className="text-xs text-vibe-muted">members</div>
          </div>
        </div>

        {/* Member avatars */}
        {pool.members && pool.members.length > 0 && (
          <div className="flex items-center gap-1 mb-3">
            {pool.members.slice(0, 5).map((m) => (
              <div
                key={m.user_id}
                className="w-7 h-7 rounded-full bg-vibe-surface border-2 border-vibe-bg flex items-center justify-center text-xs font-bold text-vibe-teal -ml-1 first:ml-0"
                title={m.user?.full_name ?? 'Member'}
              >
                {m.user?.full_name?.charAt(0) ?? '?'}
              </div>
            ))}
            {pool.members.length > 5 && (
              <div className="w-7 h-7 rounded-full bg-vibe-surface border-2 border-vibe-bg flex items-center justify-center text-xs text-vibe-muted -ml-1">
                +{pool.members.length - 5}
              </div>
            )}
          </div>
        )}

        {/* Budget if set */}
        {pool.target_budget && (
          <div className="flex items-center gap-2 text-xs text-vibe-muted mb-3">
            <span>Target:</span>
            <span className="text-vibe-text font-medium">{formatCurrency(pool.target_budget)}</span>
            {memberCount > 0 && (
              <>
                <span>·</span>
                <span>{formatCurrency(pool.target_budget / memberCount)}/person</span>
              </>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          <Link href={`/copool/${pool.id}`} className="flex-1">
            <Button size="sm" variant="secondary" className="w-full text-xs">
              View pool
            </Button>
          </Link>
          {(isCreator || isMember) && (
            <Button size="sm" variant="ghost" className="text-xs" onClick={copyInviteLink}>
              {copied ? <Check size={13} className="text-vibe-green" /> : <Copy size={13} />}
              {copied ? 'Copied!' : 'Share link'}
            </Button>
          )}
          {!isMember && !isCreator && pool.legal_status === 'forming' && (
            <Link href={`/join/${pool.invite_code}`}>
              <Button size="sm" className="text-xs">
                Join pool
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
