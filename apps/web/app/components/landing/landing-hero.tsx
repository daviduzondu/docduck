'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, ArrowRight } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { CollaborativeHero } from './collaborative-hero'
import { useAuth } from '@/providers/auth.provider'

export function LandingHero() {
  const { data, isPending } = useAuth()

  return (
    <section className="min-h-screen flex items-center justify-center relative bg-[#fafaf9] overflow-hidden">
      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none rotate-12 scale-110" style={{
        backgroundImage: `radial-gradient(rgba(0,0,0,0.08) 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
      }} />
      {/* Noise overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.035]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

      <div className="max-w-6xl mx-auto px-6 w-full">
        <div className="text-center">
          <div className="mb-10">
            <Image
              src="/docduck.png" alt="DocDuck"
              width={325} height={325}
              className="mx-auto rounded-2xl w-48 h-48 sm:w-64 sm:h-64 lg:w-[325px] lg:h-[325px]"
              sizes="(max-width: 640px) 192px, (max-width: 1024px) 256px, 325px"
              priority
            />
          </div>
          <CollaborativeHero />
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            {isPending ? (
              <Button size="lg" disabled>Loading...</Button>
            ) : data ? (
              <Link href="/dashboard/documents" className={buttonVariants({ size: 'lg' })}>
                Continue to dashboard <ChevronRight className="ml-1.5 w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link 
                  href="/auth/login" 
                  className={buttonVariants({ size: 'lg' })}
                >
                  Login
                </Link>
                <Link href="/auth/register" className={buttonVariants({ size: 'lg' })}>
                  Register <ArrowRight className="ml-1.5 w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}