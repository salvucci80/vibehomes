import { VibeMapClient } from '@/components/map/vibe-map-client'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Vibe Map — VibeHome',
}

export default async function MapPage() {
  return (
    <div className="h-[calc(100vh-56px)] flex flex-col">
      <VibeMapClient />
    </div>
  )
}
