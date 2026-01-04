'use client'

/**
 * Navigation Bar Component - SwiftUI Premium Floating Pill
 * Features: Adaptive blur, micro-interactions, pure SF-style typography.
 */

import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function Navbar() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { scrollY } = useScroll()

  // Dynamic opacity/blur based on scroll
  const navBgOpacity = useTransform(scrollY, [0, 100], [0.6, 0.9])
  const navScale = useTransform(scrollY, [0, 100], [1, 0.95])

  useEffect(() => {
    setMounted(true)
  }, [])

  const navLinks = [
    { label: 'Intelligence', href: '/' },
    { label: 'Manuscript', href: '/about' },
  ]

  if (!mounted) return null

  return (
    <div className="fixed top-10 left-0 right-0 z-50 flex justify-center px-8 pointer-events-none">
      <motion.nav 
        style={{ scale: navScale }}
        className="flex items-center gap-3 p-2 bg-white/60 dark:bg-black/60 backdrop-blur-[40px] border border-white/20 dark:border-white/5 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.12)] pointer-events-auto transition-all duration-700 hover:shadow-[0_12px_60px_rgba(0,0,0,0.2)]"
      >
        {/* Branding Button - SF Pro Black Typography */}
        <Link
          href="/"
          className="px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-full text-[11px] font-[900] uppercase tracking-[0.2em] hover:scale-105 transition-all active:scale-95 shadow-lg group"
        >
          <span className="group-hover:tracking-[0.3em] transition-all">SeekEngine</span>
        </Link>

        {/* Separator Dot */}
        <div className="w-1 h-1 rounded-full bg-zinc-200 dark:bg-zinc-800 mx-1" />

        {/* Nav Items */}
        <div className="flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest rounded-full transition-all duration-300 ${
                pathname === link.href
                  ? 'bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white shadow-inner'
                  : 'text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Dynamic Theme Toggle - Minimalist Circle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-10 h-10 flex items-center justify-center text-zinc-500 hover:text-black dark:hover:text-white rounded-full bg-zinc-50/50 dark:bg-zinc-900/50 transition-all active:scale-90 hover:rotate-90 duration-500"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </motion.nav>
    </div>
  )
}
