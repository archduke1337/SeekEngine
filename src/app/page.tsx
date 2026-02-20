'use client'

/**
 * Home Page — Creative B&W with atmospheric background
 * Inspired by cosmos.so, sanalabs.com, fiddle.digital
 */

import Hero from '../components/Hero'
import SearchBar from '../components/SearchBar'
import { motion } from 'framer-motion'

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden transition-colors duration-700 relative">
      
      {/* Subtle noise texture */}
      <div className="fixed inset-0 pointer-events-none z-50 noise" />

      {/* MAIN CONTENT */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen pb-20">
        <Hero />
        
        {/* SEARCH INTERFACE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[640px] px-6 mt-10"
        >
          <SearchBar />
        </motion.div>

        {/* Footer tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="mt-14 flex items-center gap-4 text-[9px] font-medium tracking-[0.25em] uppercase text-muted-foreground/25"
        >
          <span>Seek</span>
          <span className="w-[3px] h-[3px] rounded-full bg-foreground/10" />
          <span>Understand</span>
          <span className="w-[3px] h-[3px] rounded-full bg-foreground/10" />
          <span>Discover</span>
        </motion.div>
      </div>
    </main>
  )
}
