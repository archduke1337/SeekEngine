'use client'

/**
 * Page Layout
 * Composes the atmospheric elements (Noise, Nav) with the main Hero component.
 */

import Hero from '../components/Hero'
import RiverFooter from '../components/RiverFooter'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fbfbfd] dark:bg-[#050505] text-black dark:text-white overflow-x-hidden selection:bg-black/10 dark:selection:bg-white/20 selection:text-black dark:selection:text-white transition-colors duration-500">
      
      {/* NOISE TEXTURE OVERLAY - Adjusted for Light Mode visibility */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-50 mix-blend-overlay dark:mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }}
      />

      {/* MAIN CONTENT */}
      <Hero />

      {/* FOOTER */}
      <RiverFooter />

    </main>
  )
}
