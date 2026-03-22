import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered'
}

export function Card({ className, variant = 'default', ...props }: CardProps) {
  const variants = {
    default:  'bg-vibe-card border border-vibe-border rounded-xl',
    elevated: 'bg-vibe-card border border-white/10 rounded-xl shadow-xl shadow-black/30',
    bordered: 'bg-transparent border border-vibe-border rounded-xl',
  }

  return <div className={cn(variants[variant], className)} {...props} />
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 border-b border-vibe-border', className)} {...props} />
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5', className)} {...props} />
}
