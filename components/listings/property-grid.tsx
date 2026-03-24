import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { MapPin, CheckCircle, Users } from 'lucide-react'
import type { Property } from '../../types'

export function PropertyGrid({ properties }: { properties: Property[] }) {
  if (properties.length === 0) {
    return (
      <div className="text-center py-16 text-vibe-muted col-span-3">
        <p className="font-medium">No listings found</p>
        <p className="text-sm mt-1">Try adjusting your filters</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {properties.map((p) => (
        <PropertyCard key={p.id} property={p} />
      ))}
    </div>
  )
}

function PropertyCard({ property: p }: { property: Property }) {
  return (
    <Link href={`/listings/${p.id}`}>
      <Card className="overflow-hidden hover:border-white/14 hover:-translate-y-0.5 transition-all group cursor-pointer h-full">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-vibe-surface overflow-hidden">
          {p.images?.[0] ? (
            <Image
              src={p.images[0]}
              alt={p.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-vibe-muted/30 text-5xl">
              🏠
            </div>
          )}
          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-1.5">
            {p.verified && (
              <span className="bg-vibe-green/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle size={10} /> Verified
              </span>
            )}
            {p.co_own_ok && (
              <span className="bg-vibe-purple/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Users size={10} /> Co-Own
              </span>
            )}
          </div>
          {/* Direct badge */}
          <div className="absolute top-2 right-2">
            <span className="bg-vibe-orange/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              Direct
            </span>
          </div>
        </div>

        <CardContent className="p-4">
          <h3 className="font-syne font-bold text-vibe-text text-sm mb-1 line-clamp-1">{p.title}</h3>
          <p className="text-xs text-vibe-muted flex items-center gap-1 mb-2">
            <MapPin size={10} /> {p.neighborhood ?? p.city}
          </p>
          <div className="flex items-end justify-between">
            <div>
              <span className="font-syne font-bold text-lg text-vibe-text">
                {formatCurrency(p.price_month)}
              </span>
              <span className="text-xs text-vibe-muted">/mo</span>
            </div>
            {p.type && (
              <span className="text-[10px] text-vibe-muted bg-white/5 px-2 py-0.5 rounded-full capitalize">
                {p.type}
              </span>
            )}
          </div>
          {/* Savings vs Airbnb */}
          <div className="mt-2 text-[10px] text-vibe-green bg-vibe-green/10 px-2 py-1 rounded-lg">
            Save ~{formatCurrency(Math.round(p.price_month * 0.125))} vs Airbnb
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
