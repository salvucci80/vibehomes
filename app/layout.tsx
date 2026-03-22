import type { Metadata } from 'next'
import { DM_Sans, Syne, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' })
const syne   = Syne({ subsets: ['latin'], variable: '--font-syne', weight: ['400','700','800'] })
const ibmMono = IBM_Plex_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['400','500'] })

export const metadata: Metadata = {
  title: 'VibeHome — Find your vibe, own your space',
  description: 'Crowdsourced neighborhood reviews, direct property listings, and fractional co-ownership for Gen Z.',
  openGraph: {
    title: 'VibeHome',
    description: 'Find your vibe, own your space',
    url: 'https://vibehome.co',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${syne.variable} ${ibmMono.variable}`}>
      <body className="bg-vibe-bg text-vibe-text antialiased">
        {children}
      </body>
    </html>
  )
}
