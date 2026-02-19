'use client'

/**
 * Page Layout
 * Composes the atmospheric elements (Noise, Nav) with the main Hero component.
 */

import Hero from '../components/Hero'
import SearchBar from '../components/SearchBar'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fafafa] dark:bg-[#050505] text-black dark:text-white overflow-x-hidden transition-colors duration-700 relative">
      
      {/* NOISE TEXTURE OVERLAY */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.025] dark:opacity-[0.04] z-50 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }}
      />

      {/* MAIN CONTENT WRAPPER - Centered Vertically */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen pb-20">
        <Hero />
        
        {/* SEARCH INTERFACE - Positioned naturally below Hero */}
        <div className="w-full max-w-[640px] px-6 mt-12">
          <SearchBar />
        </div>
      </div>

      {/* FOOTER */}
      {/* FOOTER - Globally provided by Layout */}

    </main>
  )
}
