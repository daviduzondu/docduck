'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ChevronRight, ArrowRight } from 'lucide-react'
import { buttonVariants, Button } from '@/components/ui/button'
import { useAuth } from '@/providers/auth.provider'

export function LandingNavbar() {
  const { data, isPending } = useAuth()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'border-b border-gray-200 bg-white/80 backdrop-blur-xl' : ''
      }`}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold hover:opacity-85 transition-opacity">
            DocDuck
          </Link>
          <div className="flex items-center gap-3">
            {isPending ? (
              <Button size="sm" disabled>Loading...</Button>
            ) : data ? (
              <Link href="/dashboard/documents" className={buttonVariants({ size: 'sm' })}>
                Continue to dashboard <ChevronRight className="ml-1.5 w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>Login</Link>
                <Link href="/auth/register" className={buttonVariants({ size: 'sm' })}>
                  Register <ArrowRight className="ml-1.5 w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}