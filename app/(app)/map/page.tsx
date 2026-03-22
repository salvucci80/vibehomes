import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { VibeMapClient } from '@/components/map/vibe-map-client'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Vibe Map — VibeHome',
  description: 'Explore crowdsourced neighborhood vibes: noise, light, WiFi, community.',
}

export default async function MapPage() {
  return (
    <div className="h-[calc(100vh-56px)] flex flex-col">
      <Suspense fallback={<div className="flex-1 bg-vibe-bg animate-pulse" />}>
        <VibeMapClient />
      </Suspense>
    </div>
  )
}
