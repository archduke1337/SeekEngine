/**
 * Homepage — Computational Organism
 * 
 * Philosophy: You've opened the first page of something important.
 * Nothing is asking you to act yet. You're being let in, not pitched to.
 * 
 * The hero is a contained cinematic scene. Typography is minimal,
 * embedded, and deferential. Scroll feels like entering, not moving down.
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import SearchBar from '../components/SearchBar'
import RiverFooter from '../components/RiverFooter'
import { useTheme } from 'next-themes'

const Hero = dynamic(() => import('../components/Hero'), {
  ssr: false,
  loading: () => <div className="absolute inset-0" style={{ background: '#050508' }} />,
})

export default function Home() {
  const { resolvedTheme } = useTheme()
  const containerRef = useRef<HTMLElement>(null)
  const { scrollY } = useScroll()
  
  const [isTyping, setIsTyping] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [windowWidth, setWindowWidth] = useState(0)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleMotionChange = () => setPrefersReducedMotion(mediaQuery.matches)
    
    setPrefersReducedMotion(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleMotionChange)

    const update = () => setWindowWidth(window.innerWidth)
    update()

    let raf: number | null = null
    const onResize = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        update()
        raf = null
      })
    }
    
    window.addEventListener('resize', onResize)
    return () => {
        if (raf) cancelAnimationFrame(raf)
        window.removeEventListener('resize', onResize)
        mediaQuery.removeEventListener('change', handleMotionChange)
    }
  }, [])
  
  // Scroll transforms — depth separation, not collapse
  const heroOpacity = useTransform(scrollY, [0, 600], [1, 0])
  const heroDepth = useTransform(scrollY, [0, 600], [1, 1.15])
  
  // Typography parallax — subtle, embedded in the world
  const titleY = useTransform(scrollY, [0, 600], [0, -80])
  const titleOpacity = useTransform(scrollY, [0, 300], [1, 0])
  
  // Search bar subtle movement
  const searchY = useTransform(scrollY, [0, 600], [0, -40])
  const searchOpacity = useTransform(scrollY, [0, 400], [1, 0])
  
  // Smooth springs for heavy feel
  const smoothTitleY = useSpring(titleY, { stiffness: 50, damping: 20 })
  const smoothSearchY = useSpring(searchY, { stiffness: 50, damping: 20 })

  const isDark = mounted ? resolvedTheme === 'dark' : true
  const isMobile = windowWidth < 768
  const isHighPower = (isTyping || isFocused) && !prefersReducedMotion

  return (
    <>
      <main 
        className="min-h-screen flex flex-col overflow-x-hidden selection:bg-white/10 selection:text-current"
        style={{ background: '#050508' }}
      >
        {/* Hero Section — The Scene */}
        <section 
          ref={containerRef}
          className="relative h-screen flex flex-col items-center justify-center" 
          aria-label="SeekEngine"
        >
          {/* 3D Volumetric Hero */}
          <motion.div 
            style={{ 
              scale: heroDepth, 
              opacity: heroOpacity
            } as any} 
            className="absolute inset-0 z-0 will-change-transform"
          >
            {mounted ? (
              <Hero isHighPower={isHighPower} isDark={isDark} isMobile={isMobile} />
            ) : (
              <div className="absolute inset-0" style={{ background: '#050508' }} />
            )}
          </motion.div>

          {/* Content Layer — Typography embedded in the world */}
          <div className="w-full max-w-5xl relative z-10 flex flex-col items-center gap-12 sm:gap-20 px-6">
            
            {/* Title — minimal, deferential */}
            <motion.div 
              style={{ y: smoothTitleY, opacity: titleOpacity } as any}
              className="text-center will-change-transform"
            >
              <h1 className="sr-only">SeekEngine — Intent-First Grounded Intelligence Search</h1>
              
              {/* Brand mark — not shouting, just present */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <p 
                  className="text-[2.5rem] sm:text-[4rem] md:text-[5rem] font-extralight tracking-[-0.04em] leading-none"
                  style={{ 
                    color: 'rgba(255, 255, 255, 0.06)',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
                  }}
                >
                  SeekEngine
                </p>
              </motion.div>
              
              {/* Tagline — barely there */}
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
                className="mt-6 sm:mt-8 text-sm sm:text-base font-light tracking-wide"
                style={{ 
                  color: 'rgba(255, 255, 255, 0.25)',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                }}
              >
                Intent-first intelligence
              </motion.p>
            </motion.div>

            {/* Search — functional, not decorative */}
            <motion.div 
              style={{ y: smoothSearchY, opacity: searchOpacity } as any}
              className="w-full max-w-xl relative will-change-transform"
              role="search"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5, delay: 2, ease: [0.16, 1, 0.3, 1] }}
              >
                <SearchBar 
                  autoFocus 
                  onTyping={setIsTyping} 
                  onFocusChange={setIsFocused}
                />
              </motion.div>
            </motion.div>
          </div>

          {/* Bottom gradient — transition to content like a dissolve */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none z-20"
            style={{
              background: 'linear-gradient(to top, #050508 0%, transparent 100%)',
            }}
          />
        </section>

        {/* Content area — the scene continues */}
        <div style={{ background: '#050508' }}>
          <RiverFooter />
        </div>
      </main>
    </>
  )
}
