/**
 * Homepage - SwiftUI Premium Experience
 * Features: 3D interactive hero, fluid deblur, floating glass search architecture.
 * Updated: Apple Typography, Improved Content, capabilities scroll section.
 */

'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { motion, useScroll, useTransform, useMotionTemplate, AnimatePresence } from 'framer-motion'
import SearchBar from '../components/SearchBar'
import RiverFooter from '../components/RiverFooter'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useEffect, useState as useReactState } from 'react'
import { ThreeErrorBoundary } from '../components/ThreeErrorBoundary'

const Hero3D = dynamic(() => import('../components/Hero3D'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-white dark:bg-black" />,
})

export default function Home() {
  const router = useRouter()
  const { theme, resolvedTheme } = useTheme()
  const { scrollY } = useScroll()
  const [isTyping, setIsTyping] = useState(false)
  const [mounted, setMounted] = useReactState(false)
  const [windowWidth, setWindowWidth] = useReactState(0)

  useEffect(() => {
    setMounted(true)
    setWindowWidth(window.innerWidth)
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [setMounted, setWindowWidth])
  
  const opacityValue = useTransform(scrollY, [0, 400], [1, 0.1])
  const heroScale = useTransform(scrollY, [0, 600], [1, 1.4])
  const contentY = useTransform(scrollY, [0, 600], [0, -120])

  const isDark = mounted ? resolvedTheme === 'dark' : true
  const isMobile = windowWidth < 768

  return (
    <>
      <main className="min-h-screen flex flex-col bg-[#fbfbfd] dark:bg-[#000000] transition-colors duration-1000 overflow-x-hidden">
        
        {/* Dynamic Grid Overlay */}
        <div className="fixed inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] pointer-events-none" />

        {/* Hero Section */}
        <section className="relative h-screen flex flex-col items-center justify-center px-6">
          <motion.div 
            style={{ 
              scale: heroScale, 
              opacity: opacityValue,
              willChange: "transform, opacity"
            }} 
            className="absolute inset-0 z-0"
          >
            <ThreeErrorBoundary>
              <Hero3D isHighPower={isTyping} isDark={isDark} isMobile={isMobile} />
            </ThreeErrorBoundary>
          </motion.div>

          <motion.div 
            style={{ opacity: useTransform(scrollY, [0, 400], [0, 0.4]) }}
            className="absolute inset-0 pointer-events-none z-10 bg-white dark:bg-black"
          />

          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#fbfbfd] dark:to-black z-20 pointer-events-none" />

          {/* Heading and Search */}
          <motion.div 
            style={{ 
              y: contentY,
              willChange: "transform"
            }}
            className="w-full max-w-5xl relative z-30 flex flex-col items-center gap-10 sm:gap-16"
          >
            <div className="text-center space-y-8 sm:space-y-12">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <h1 className="sr-only">SeekEngine</h1>
                <div className="h-32 sm:h-56" /> {/* Reduced Spacer for 3D Hero Title */}
                
                <motion.p 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  className="text-lg sm:text-3xl text-zinc-500 dark:text-zinc-400 font-medium max-w-3xl mx-auto leading-relaxed tracking-tighter px-6 font-sans italic"
                >
                  The future of discovery is not a list of links. <br className="hidden sm:block" />
                  It is a <span className="text-black dark:text-white font-black not-italic border-b border-black/10 dark:border-white/10 pb-1">sensed synthesis of human intent.</span>
                </motion.p>
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.8, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-2xl px-6 relative"
            >
              <SearchBar autoFocus onTyping={setIsTyping} />
            </motion.div>

            {/* Live Synthesis Feed */}
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 1.2, duration: 1.5 }}
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
