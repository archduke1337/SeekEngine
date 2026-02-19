'use client'

/**
 * Home Page — Modern Gradient UI
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
          transition={{ delay: 0.7, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[640px] px-6 mt-10"
        >
          <SearchBar />
        </motion.div>

        {/* Footer tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="mt-12 flex items-center gap-3 text-[10px] font-medium tracking-[0.15em] uppercase text-muted-foreground/40"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
          <span>Seek</span>
          <span className="opacity-40"></span>
          <span>Understand</span>
          <span className="opacity-40"></span>
          <span>Discover</span>
          <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
        </motion.div>
      </div>
    </main>
  )
}
