import { cn, vibeScoreColor } from '@/lib/utils'

interface VibeScoreProps {
  label: string
  score: number
  icon?: string
  className?: string
}

export function VibeScore({ label, score, icon, className }: VibeScoreProps) {
  const pct = (score / 10) * 100

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-vibe-muted flex items-center gap-1">
          {icon && <span>{icon}</span>}
          {label}
        </span>
        <span className={cn('text-xs font-mono font-medium', vibeScoreColor(score))}>
          {score.toFixed(1)}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            score >= 8 ? 'bg-vibe-green' :
            score >= 6 ? 'bg-vibe-teal' :
            score >= 4 ? 'bg-vibe-yellow' : 'bg-red-400'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
