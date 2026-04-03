'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const SCORES = [1,2,3,4,5,6,7,8,9,10]

function ScorePicker({ label, icon, value, onChange }: {
  label: string; icon: string; value: number; onChange: (v: number) => void
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-medium text-vibe-text">{label}</span>
        <span className="ml-auto font-mono font-bold text-vibe-teal">{value}/10</span>
      </div>
      <div className="flex gap-1">
        {SCORES.map(n => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`flex-1 h-8 rounded-lg text-xs font-bold transition-all ${
              n <= value
                ? 'bg-vibe-teal text-vibe-bg'
                : 'bg-white/5 text-vibe-muted hover:bg-white/10'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function NewVibePage() {
  const router = useRouter()
  const [neighborhood, setNeighborhood] = useState('')
  const [city, setCity] = useState('')
  const [noise, setNoise] = useState(5)
  const [light, setLight] = useState(5)
  const [wifi, setWifi] = useState(5)
  const [community, setCommunity] = useState(5)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!neighborhood || !city) {
      setError('Please enter your neighborhood and city')
      return
    }
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login?redirect=/vibes/new')
      return
    }

    const { error: err } = await supabase.from('vibe_reviews').insert({
      user_id: user.id,
      neighborhood,
      city,
      noise_score: noise,
      light_score: light,
      wifi_score: wifi,
      community_score: community,
      notes: notes || null,
    })

    if (err) {
      setError('Failed to submit. Please try again.')
      setLoading(false)
    } else {
      router.push('/map')
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/map">
          <button className="text-vibe-muted hover:text-vibe-text transition-colors">
            <ArrowLeft size={20} />
          </button>
        </Link>
        <div>
          <h1 className="font-syne font-bold text-xl text-vibe-text">Review your area</h1>
          <p className="text-xs text-vibe-muted">Help others find their vibe</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-5">
          {/* Location */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={14} className="text-vibe-orange" />
              <span className="text-sm font-medium text-vibe-text">Location</span>
            </div>
            <input
              type="text"
              placeholder="Neighborhood (e.g. Williamsburg)"
              value={neighborhood}
              onChange={e => setNeighborhood(e.target.value)}
              className="w-full bg-vibe-surface border border-vibe-border rounded-xl px-4 py-2.5 text-sm text-vibe-text placeholder:text-vibe-muted focus:outline-none focus:border-vibe-teal transition-colors mb-2"
            />
            <input
              type="text"
              placeholder="City (e.g. New York)"
              value={city}
              onChange={e => setCity(e.target.value)}
              className="w-full bg-vibe-surface border border-vibe-border rounded-xl px-4 py-2.5 text-sm text-vibe-text placeholder:text-vibe-muted focus:outline-none focus:border-vibe-teal transition-colors"
            />
          </div>

          {/* Scores */}
          <div className="mb-4">
            <p className="text-sm font-medium text-vibe-text mb-3">Rate your neighborhood</p>
            <ScorePicker label="Noise level" icon="🔊" value={noise} onChange={setNoise} />
            <ScorePicker label="Natural light" icon="💡" value={light} onChange={setLight} />
            <ScorePicker label="WiFi / connectivity" icon="📶" value={wifi} onChange={setWifi} />
            <ScorePicker label="Community vibe" icon="🤝" value={community} onChange={setCommunity} />
          </div>

          {/* Notes */}
          <div className="mb-5">
            <textarea
              placeholder="Anything else to add? (optional)"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="w-full bg-vibe-surface border border-vibe-border rounded-xl px-4 py-2.5 text-sm text-vibe-text placeholder:text-vibe-muted focus:outline-none focus:border-vibe-teal transition-colors resize-none"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-400/10 px-3 py-2 rounded-lg mb-4">{error}</p>
          )}

          <Button className="w-full" loading={loading} onClick={handleSubmit}>
            Submit vibe review
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
