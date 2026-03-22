import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Tailwind class merging
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format cents to currency string
export function formatCurrency(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(cents / 100)
}
// Format percentage
export function formatPct(value: number): string {
  return `${value.toFixed(1)}%`
}

// Vibe score colour helper
export function vibeScoreColor(score: number): string {
  if (score >= 8) return 'text-vibe-green'
  if (score >= 6) return 'text-vibe-teal'
  if (score >= 4) return 'text-vibe-yellow'
  return 'text-red-400'
}

// Generate short readable invite code
export function generateInviteCode(id: string): string {
  return id.slice(0, 8).toUpperCase()
}
