import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // VibeHome brand
        vibe: {
          bg:      '#0D0D14',
          surface: '#141420',
          card:    '#1A1A2A',
          border:  'rgba(255,255,255,0.08)',
          text:    '#F0EFE8',
          muted:   '#8A8898',
          orange:  '#FF6B35',
          teal:    '#4ECDC4',
          yellow:  '#FFE66D',
          green:   '#2ECC71',
          purple:  '#A78BFA',
          blue:    '#60A5FA',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        syne: ['Syne', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '12px',
      },
    },
  },
  plugins: [],
}
export default config
