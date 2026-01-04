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
    <div className="fixed top-6 sm:top-8 left-0 right-0 z-50 flex justify-center px-4 sm:px-8 pointer-events-none">
      <motion.nav 
        style={{ scale: navScale }}
        className="flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-[60px] border border-white/40 dark:border-white/5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.08)] pointer-events-auto transition-all duration-700 hover:shadow-[0_12px_48px_rgba(0,0,0,0.15)]"
      >
        {/* Branding Button - SF Pro Black Typography */}
        <Link
          href="/"
          className="px-4 sm:px-6 py-2 sm:py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-full text-[9px] sm:text-[11px] font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] hover:scale-[1.03] transition-all active:scale-95 shadow-sm group"
        >
          <span className="group-hover:tracking-[0.3em] transition-all duration-500">SeekEngine</span>
        </Link>

        {/* Dynamic Nav Items */}
        <div className="flex items-center ml-0.5 sm:ml-1">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`px-3 sm:px-5 py-2 sm:py-2.5 text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.15em] rounded-full transition-all duration-500 ${
                pathname === link.href
                  ? 'bg-zinc-950/5 dark:bg-white/10 text-black dark:text-white'
                  : 'text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-950/5 dark:hover:bg-white/5'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Separator */}
        <div className="w-[1px] h-3 sm:h-4 bg-zinc-200 dark:bg-white/10 mx-1.5 sm:mx-2" />

        {/* Theme Toggle - Ultra Smooth Rotation */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-zinc-500 hover:text-black dark:hover:text-white rounded-full bg-white/0 hover:bg-zinc-950/5 dark:hover:bg-white/5 transition-all active:scale-90 hover:rotate-180 duration-1000"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </motion.nav>
    </div>
  )
}
