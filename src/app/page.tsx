/**
 * Homepage - SwiftUI Premium Experience
 * Features: 3D interactive hero, fluid deblur, floating glass search architecture.
 */

'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { motion, useScroll, useTransform } from 'framer-motion'
import SearchBar from '../components/SearchBar'
import RiverFooter from '../components/RiverFooter'
import { useTheme } from 'next-themes'
import { ThreeErrorBoundary } from '../components/ThreeErrorBoundary'

const Hero3D = dynamic(() => import('../components/Hero3D'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-white dark:bg-black" />,
})

export default function Home() {
  const { resolvedTheme } = useTheme()
  const { scrollY } = useScroll()
  
  const [isTyping, setIsTyping] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [windowWidth, setWindowWidth] = useState(0)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Perceptual Hardening: Reactive reduced-motion handling
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
  
  const opacityValue = useTransform(scrollY, [0, 400], [1, 0.1])
  const heroScale = useTransform(scrollY, [0, 600], [1, 1.4])
  const contentY = useTransform(scrollY, [0, 600], [0, -120])
  const veilOpacity = useTransform(scrollY, [0, 400], [0, 0.4])

  // Hydration-safe theme check
  const isDark = mounted ? resolvedTheme === 'dark' : true
  const isMobile = windowWidth < 768
  const isHighPower = (isTyping || isFocused) && !prefersReducedMotion

  return (
    <>
      <main className="min-h-screen flex flex-col bg-[#fbfbfd] dark:bg-[#000000] transition-colors duration-1000 overflow-x-hidden selection:bg-red-500/[0.08] dark:selection:bg-red-500/20 selection:text-current">
        
        {/* Dynamic Grid Overlay */}
        <div className="fixed inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] pointer-events-none" />

        {/* Hero Section */}
        <section className="relative h-screen flex flex-col items-center justify-center px-6" aria-label="Search introduction">
          <motion.div 
            style={{ 
              scale: heroScale, 
              opacity: opacityValue
            } as any} 
            className="absolute inset-0 z-0 will-change-transform will-change-opacity"
          >
            {mounted && !prefersReducedMotion ? (
              <ThreeErrorBoundary>
                <Hero3D isHighPower={isHighPower} isDark={isDark} isMobile={isMobile} />
              </ThreeErrorBoundary>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-black opacity-50" />
            )}
          </motion.div>

          <motion.div 
            style={{ opacity: veilOpacity } as any}
            className="absolute inset-0 pointer-events-none z-10 bg-white dark:bg-black"
          />

          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#fbfbfd] dark:to-black z-20 pointer-events-none" />

          {/* Heading and Search */}
          <motion.div 
            style={{ y: contentY } as any}
            className="w-full max-w-5xl relative z-30 flex flex-col items-center gap-10 sm:gap-16 will-change-transform"
          >
            <div className="text-center space-y-8 sm:space-y-12">
              <motion.div
                {...({
                  initial: { opacity: 0, y: 40 },
                  animate: { opacity: 1, y: 0 },
                  transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
                } as any)}
              >
                <h1 className="sr-only">SeekEngine — Intent-First Grounded Intelligence Search</h1>
                <div className="h-32 sm:h-56" /> {/* Reduced Spacer for 3D Hero Title */}
                
                <motion.p 
                  {...({
                    initial: { opacity: 0, scale: 0.95 },
                    animate: { opacity: 1, scale: 1 },
                    transition: { delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }
                  } as any)}
                  className="text-lg sm:text-3xl text-zinc-500 dark:text-zinc-400 font-medium max-w-3xl mx-auto leading-relaxed tracking-tighter px-6 font-sans italic"
                >
                  The future of discovery is not a list of links. <br className="hidden sm:block" />
                  It is a <span className="text-black dark:text-white font-black not-italic border-b border-black/10 dark:border-white/10 pb-1">sensed synthesis of human intent.</span>
                </motion.p>
              </motion.div>
            </div>

            <motion.div 
              {...({
                initial: { opacity: 0, y: 20, scale: 0.98 },
                animate: { opacity: 1, y: 0, scale: 1 },
                transition: { delay: 0.8, duration: 1.2, ease: [0.16, 1, 0.3, 1] }
              } as any)}
              className="w-full max-w-2xl px-6 relative"
              role="search"
            >
              <SearchBar 
                autoFocus 
                onTyping={setIsTyping} 
                onFocusChange={setIsFocused}
              />
            </motion.div>

            {/* Live Synthesis Feed */}
            <motion.div
               {...({
                 initial: { opacity: 0 },
                 animate: { opacity: 1 },
                 transition: { delay: 1.2, duration: 1.5 }
               } as any)}
               className="w-full"
            >
            </motion.div>
          </motion.div>

        </section>

        <RiverFooter />
      </main>
    </>
  )
}
