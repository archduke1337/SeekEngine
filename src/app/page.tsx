'use client'

/**
 * Home Page — Retro-Futuristic Terminal Interface
 */

import Hero from '../components/Hero'
import SearchBar from '../components/SearchBar'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'

export default function Home() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isDark = mounted ? resolvedTheme === 'dark' : true

  return (
    <main className="min-h-screen text-[var(--fg)] overflow-x-hidden transition-colors duration-700 relative"
          style={{ background: isDark ? '#0a0a0f' : '#f0f0f5' }}>
      
      {/* CRT NOISE TEXTURE */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015] dark:opacity-[0.03] z-50 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }}
      />

      {/* AMBIENT GLOW */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[150px] opacity-20"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(0,255,240,0.15) 0%, rgba(180,0,255,0.05) 50%, transparent 70%)'
              : 'radial-gradient(circle, rgba(0,144,255,0.1) 0%, rgba(144,0,224,0.03) 50%, transparent 70%)'
          }}
        />
      </div>

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

        {/* TERMINAL FOOTER */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="mt-12 flex items-center gap-3 font-mono text-[10px] tracking-[0.2em] uppercase"
          style={{ color: isDark ? 'rgba(0,255,240,0.2)' : 'rgba(0,144,255,0.25)' }}
        >
          <span className="w-1 h-1 rounded-full" style={{ background: isDark ? '#00fff0' : '#0090ff' }} />
          <span>Seek</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>Understand</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>Discover</span>
          <span className="w-1 h-1 rounded-full" style={{ background: isDark ? '#00fff0' : '#0090ff' }} />
        </motion.div>
      </div>
    </main>
  )
}
