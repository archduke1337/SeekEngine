'use client'

/**
 * Navigation Bar — Retro-Futuristic Floating Terminal Bar
 */

import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'

export default function Navbar() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { scrollY } = useScroll()
  const [visible, setVisible] = useState(true)

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0
    const diff = latest - previous
    if (Math.abs(diff) < 5) return
    const shouldBeVisible = !(latest > previous && latest > 200)
    setVisible(v => (v === shouldBeVisible ? v : shouldBeVisible))
  })

  useEffect(() => { setMounted(true) }, [])

  const navLinks = [
    { label: 'Engine', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Research', href: 'https://archduke.is-a.dev/research/seekengine', external: true },
    { label: 'Dev', href: 'https://archduke.is-a.dev/about', external: true },
  ]

  if (!mounted) {
    return <div className="fixed top-6 sm:top-8 left-0 right-0 h-12 pointer-events-none" />
  }

  const isDarkMode = resolvedTheme === 'dark'
  const accentColor = isDarkMode ? '#00fff0' : '#0090ff'

  return (
    <div className="fixed top-4 sm:top-6 left-0 right-0 z-50 flex justify-center px-4 sm:px-8 pointer-events-none">
      <motion.nav 
        role="navigation"
        aria-label="Primary navigation"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: visible ? 0 : -100, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-1 sm:gap-1.5 p-1.5 sm:p-2 rounded-xl pointer-events-auto transition-all duration-700"
        style={{
          background: isDarkMode ? 'rgba(14, 14, 22, 0.85)' : 'rgba(240, 240, 248, 0.85)',
          backdropFilter: 'blur(20px) saturate(120%)',
          WebkitBackdropFilter: 'blur(20px) saturate(120%)',
          border: isDarkMode ? '1px solid rgba(0,255,240,0.06)' : '1px solid rgba(0,144,255,0.08)',
          boxShadow: isDarkMode 
            ? '0 4px 24px -6px rgba(0,0,0,0.5), 0 0 20px -10px rgba(0,255,240,0.1)' 
            : '0 4px 24px -6px rgba(0,0,0,0.08), 0 0 20px -10px rgba(0,144,255,0.08)',
        }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg overflow-hidden ml-0.5 sm:ml-1 flex-shrink-0 hover:scale-105 transition-transform duration-300">
          <Image
            src="/logo.png"
            alt="SeekEngine"
            width={28}
            height={28}
            className="w-7 h-7 sm:w-8 sm:h-8"
            priority
          />
        </Link>

        {/* Separator */}
        <div className="w-[1px] h-3 sm:h-4 mx-0.5 sm:mx-1" style={{ background: `${accentColor}15` }} />

        {/* Nav Items */}
        <div className="flex items-center relative gap-0.5 sm:gap-1 px-1">
          {navLinks.map((link) => {
            const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
            
            return (
              <Link
                key={link.label}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                aria-label={link.label}
                aria-current={isActive ? "page" : undefined}
                className={`relative px-3 sm:px-4 py-2 sm:py-2 font-mono text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.15em] sm:tracking-[0.2em] rounded-lg transition-all duration-300 ${
                  isActive
                    ? ''
                    : 'hover:opacity-80'
                }`}
                style={{
                  color: isActive ? accentColor : (isDarkMode ? '#6b6b80' : '#6b6b80'),
                  textShadow: isActive && isDarkMode ? `0 0 10px ${accentColor}44` : 'none',
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="seekengine-nav-active"
                    className="absolute inset-0 rounded-lg"
                    style={{
                      background: isDarkMode ? 'rgba(0,255,240,0.05)' : 'rgba(0,144,255,0.06)',
                      border: isDarkMode ? '1px solid rgba(0,255,240,0.1)' : '1px solid rgba(0,144,255,0.1)',
                    }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Separator */}
        <div className="w-[1px] h-3 sm:h-4 mx-1" style={{ background: `${accentColor}15` }} />

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
          className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg active:scale-90 transition-all duration-300 group overflow-hidden"
          style={{
            color: isDarkMode ? '#6b6b80' : '#6b6b80',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = accentColor }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#6b6b80' }}
          aria-label="Toggle theme"
        >
          <div className="relative w-4 h-4 overflow-hidden pointer-events-none">
            <motion.div
              animate={{ y: isDarkMode ? 0 : -32 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              className="flex flex-col gap-4 items-center"
            >
              {/* Sun (dark mode) */}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              {/* Moon (light mode) */}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </motion.div>
          </div>
        </button>
      </motion.nav>
    </div>
  )
}
