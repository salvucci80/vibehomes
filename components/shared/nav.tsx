'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Map, Home, Users, BarChart3, User } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/map',      label: 'Vibe Map',  icon: Map },
  { href: '/listings', label: 'Listings',  icon: Home },
  { href: '/copool',   label: 'Co-Pool',   icon: Users },
  { href: '/host',     label: 'Host',      icon: BarChart3 },
  { href: '/profile',  label: 'Profile',   icon: User },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50 bg-vibe-surface border-b border-vibe-border">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/map" className="flex items-center gap-2">
          <span className="font-syne font-bold text-vibe-text">VibeHome</span>
          <span className="text-[10px] font-bold bg-vibe-orange text-white px-1.5 py-0.5 rounded">BETA</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                pathname.startsWith(href)
                  ? 'bg-vibe-card text-vibe-teal'
                  : 'text-vibe-muted hover:text-vibe-text hover:bg-white/5'
              )}
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </div>

        {/* Mobile bottom nav is handled separately */}
      </div>
    </nav>
  )
}

// Mobile bottom tab bar
export function BottomNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-vibe-surface border-t border-vibe-border md:hidden z-50 pb-safe">
      <div className="flex items-center justify-around h-16">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all',
              pathname.startsWith(href)
                ? 'text-vibe-teal'
                : 'text-vibe-muted'
            )}
          >
            <Icon size={20} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
