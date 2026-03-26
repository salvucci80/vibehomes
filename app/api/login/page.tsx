import { Suspense } from 'react'
import LoginPageClient from './LoginPageClient'

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center px-4 bg-vibe-bg">Loading...</div>}>
      <LoginPageClient />
    </Suspense>
  )
}