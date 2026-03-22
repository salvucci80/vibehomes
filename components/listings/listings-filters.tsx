'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { SlidersHorizontal } from 'lucide-react'

export function ListingsFilters() {
  const router = useRouter()
  const params = useSearchParams()

  const setFilter = useCallback((key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString())
    if (value === null || value === '') {
      next.delete(key)
    } else {
      next.set(key, value)
    }
    router.push(`/listings?${next.toString()}`)
  }, [params, router])

  const types = ['apartment', 'house', 'room', 'co-living']
  const activeType = params.get('type')
  const coOwnActive = params.get('co_own') === 'true'

  return (
    <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1 scrollbar-none flex-wrap">
      <div className="flex items-center gap-1 text-xs text-vibe-muted mr-1">
        <SlidersHorizontal size={12} /> Type:
      </div>
      {types.map((t) => (
        <button
          key={t}
          onClick={() => setFilter('type', activeType === t ? null : t)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap capitalize ${
            activeType === t
              ? 'bg-vibe-orange text-white border-vibe-orange'
              : 'bg-transparent text-vibe-muted border-vibe-border hover:border-white/20 hover:text-vibe-text'
          }`}
        >
          {t}
        </button>
      ))}
      <button
        onClick={() => setFilter('co_own', coOwnActive ? null : 'true')}
        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${
          coOwnActive
            ? 'bg-vibe-purple text-white border-vibe-purple'
            : 'bg-transparent text-vibe-muted border-vibe-border hover:border-white/20 hover:text-vibe-text'
        }`}
      >
        Co-Own available
      </button>
      {(activeType || coOwnActive) && (
        <Button
          size="sm"
          variant="ghost"
          className="text-xs ml-auto"
          onClick={() => router.push('/listings')}
        >
          Clear filters
        </Button>
      )}
    </div>
  )
}
