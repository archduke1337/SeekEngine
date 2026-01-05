'use client'

/**
 * Navigation Bar Component - SwiftUI Premium Floating Pill
 * Features: Adaptive blur, micro-interactions, pure SF-style typography.
 */

import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'

export default function Navbar() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { scrollY } = useScroll()

  // Visibility logic: synchronized with momentum scroll
  const [visible, setVisible] = useState(true)

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0
    const diff = latest - previous
    
    // Only toggle if we've moved significantly to avoid jitter
    if (Math.abs(diff) < 5) return

    const shouldBeVisible = !(latest > previous && latest > 200)
    // Guard state update to avoid redundant re-renders
    setVisible(v => (v === shouldBeVisible ? v : shouldBeVisible))
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const navLinks = [
    { label: 'Engine', href: '/' },
    { label: 'Project', href: '/about' },
  ]

  if (!mounted) {
    return <div className="fixed top-6 sm:top-8 left-0 right-0 h-12 pointer-events-none" />
  }

  const isDarkMode = resolvedTheme === 'dark'

  return (
    <div className="fixed top-6 sm:top-8 left-0 right-0 z-50 flex justify-center px-4 sm:px-8 pointer-events-none">
      <motion.nav 
        role="navigation"
        aria-label="Primary navigation"
        initial={{ y: -100, opacity: 0 }}
        animate={{ 
          y: visible ? 0 : -100, 
          opacity: visible ? 1 : 0 
        }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-1 sm:gap-1.5 p-1.5 sm:p-2 bg-white/70 dark:bg-black/60 backdrop-blur-2xl backdrop-saturate-150 border border-white/20 dark:border-white/10 rounded-full shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12)] pointer-events-auto transition-all duration-700 hover:shadow-[0_12px_48px_-12px_rgba(0,0,0,0.15)] ring-1 ring-black/5 dark:ring-white/5"
      >
        {/* Dynamic Nav Items */}
        <div className="flex items-center relative gap-0.5 sm:gap-1 px-1">
          {navLinks.map((link) => {
            // Future-proof nested route matching
            const isActive = link.href === '/' 
              ? pathname === '/' 
              : pathname.startsWith(link.href)
            
            return (
              <Link
                key={link.label}
                href={link.href}
                aria-label={link.label}
                aria-current={isActive ? "page" : undefined}
                className={`relative px-3 sm:px-5 py-2 sm:py-2.5 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] rounded-full transition-all duration-500 ${
                  isActive
                    ? 'text-black dark:text-white'
                    : 'text-zinc-500 hover:text-black dark:hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="seekengine-nav-active"
                    className="absolute inset-0 bg-black/5 dark:bg-white/10 rounded-full shadow-sm"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Separator */}
        <div className="w-[1px] h-3 sm:h-4 bg-zinc-400/20 dark:bg-white/15 mx-1" />

        {/* Theme Toggle - Ultra Premium Shift */}
        <button
          onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
          className="relative w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white rounded-full bg-transparent hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-95 duration-700 group overflow-hidden"
          aria-label="Toggle theme"
        >
          <div className="relative w-5 h-5 overflow-hidden pointer-events-none">
            <motion.div
              animate={{ y: isDarkMode ? 0 : -48 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              className="flex flex-col gap-7 items-center"
            >
              {/* Sun Icon (Visible in Dark Mode) */}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              {/* Moon Icon (Visible in Light Mode) */}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </motion.div>
          </div>
          
          {/* Dynamic Radial Glow */}
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none blur-xl ${
            isDarkMode ? 'bg-orange-400/20' : 'bg-red-500/20'
          }`} />
        </button>
      </motion.nav>
    </div>
  )
}
