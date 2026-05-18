'use client'

import { LandingNavbar, LandingHero, LandingFooter, BentoGrid, Testimonials } from './components/landing'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <LandingNavbar />
      <LandingHero />
      <Features />
      <Testimonials />
      <LandingFooter />
    </div>
  )
}

function Features() {
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-semibold tracking-tight mb-3 text-gray-900">What you get</h2>
          <p className="text-gray-500">The basics, done well.</p>
        </div>
        <BentoGrid />
      </div>
    </section>
  )
}