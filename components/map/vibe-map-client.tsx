'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { VibeScore } from '@/components/ui/vibe-score'
import { Button } from '@/components/ui/button'
import { MapPin, Plus } from 'lucide-react'
import type { NeighbourhoodVibe } from '../../types'

export function VibeMapClient() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const [vibes, setVibes] = useState<NeighbourhoodVibe[]>([])
  const [selected, setSelected] = useState<NeighbourhoodVibe | null>(null)

  const fetchVibes = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch(`/api/vibes/nearby?lat=${lat}&lng=${lng}&radius=8000`)
      const { data } = await res.json()
      if (data) setVibes(data)
    } catch (err) {
      console.error('Failed to fetch vibes', err)
    }
  }, [])

  useEffect(() => {
    import('mapbox-gl').then((mb) => {
      const mapboxgl = mb.default
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!
      if (!mapContainer.current) return
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-74.006, 40.7128],
        zoom: 12,
      })
      mapRef.current = map
      map.on('load', () => fetchVibes(40.7128, -74.006))
    })
    return () => { mapRef.current?.remove() }
  }, [fetchVibes])

  useEffect(() => {
    if (!mapRef.current || vibes.length === 0) return
    import('mapbox-gl').then((mb) => {
      const mapboxgl = mb.default
      vibes.forEach((vibe) => {
        const el = document.createElement('div')
        el.style.cssText = `
          width:44px;height:44px;border-radius:50%;
          background:${vibe.overall_score >= 7 ? '#4ECDC4' : vibe.overall_score >= 5 ? '#FFE66D' : '#FF6B35'};
          border:2px solid rgba(255,255,255,0.2);
          display:flex;align-items:center;justify-content:center;
          font-weight:800;font-size:14px;color:#0D0D14;cursor:pointer;
          box-shadow:0 4px 12px rgba(0,0,0,0.4);
        `
        el.textContent = vibe.overall_score.toFixed(1)
        el.addEventListener('click', () => setSelected(vibe))
        new mapboxgl.Marker({ element: el })
          .setLngLat([vibe.lng, vibe.lat])
          .addTo(mapRef.current)
      })
    })
  }, [vibes])

  return (
    <div className="relative flex-1 h-full">
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute top-4 right-4 z-10">
        <Button size="sm" onClick={() => alert('Coming soon! Vibe reviews launching next.')}>
          <Plus size={14} /> Review your area
        </Button>
      </div>
      {selected && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-10">
          <div className="bg-vibe-surface/95 backdrop-blur border border-vibe-border rounded-2xl p-4 shadow-2xl">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-syne font-bold text-vibe-text">{selected.neighborhood}</h3>
                <p className="text-xs text-vibe-muted mt-0.5 flex items-center gap-1">
                  <MapPin size={11} /> {selected.city}
                </p>
              </div>
              <div className="text-right">
                <div className="font-syne font-bold text-2xl text-vibe-teal">{selected.overall_score.toFixed(1)}</div>
                <div className="text-xs text-vibe-muted">overall</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <VibeScore label="Noise" icon="🔊" score={selected.avg_noise} />
              <VibeScore label="Light" icon="💡" score={selected.avg_light} />
              <VibeScore label="WiFi" icon="📶" score={selected.avg_wifi} />
              <VibeScore label="Community" icon="🤝" score={selected.avg_community} />
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="secondary" className="flex-1 text-xs" onClick={() => setSelected(null)}>Close</Button>
              <Button size="sm" className="flex-1 text-xs" onClick={() => window.location.href = `/listings?neighborhood=${encodeURIComponent(selected.neighborhood)}`}>See listings</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
