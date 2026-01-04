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
  }, [])
  
  const blurValue = useTransform(scrollY, [0, 400], [0, 15])
  const opacityValue = useTransform(scrollY, [100, 400], [1, 0.15])
  const heroScale = useTransform(scrollY, [0, 500], [1, 1.3])
  const contentY = useTransform(scrollY, [0, 500], [0, -80])
  const backdropFilter = useMotionTemplate`blur(${blurValue}px)`

  const isDark = mounted ? resolvedTheme === 'dark' : true
  const isMobile = windowWidth < 768

  return (
    <>
      <main className="min-h-screen flex flex-col bg-[#fbfbfd] dark:bg-[#000000] transition-colors duration-1000 overflow-x-hidden">
        
        {/* Dynamic Grid Overlay */}
        <div className="fixed inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] pointer-events-none" />

        {/* Hero Section */}
        <section className="relative h-screen flex flex-col items-center justify-center px-6">
          <motion.div style={{ scale: heroScale, opacity: opacityValue }} className="absolute inset-0 z-0">
            <ThreeErrorBoundary>
              <Hero3D isHighPower={isTyping} isDark={isDark} isMobile={isMobile} />
            </ThreeErrorBoundary>
          </motion.div>

          <motion.div 
            style={{ backdropFilter, WebkitBackdropFilter: backdropFilter }}
            className="absolute inset-0 pointer-events-none z-10"
          />

          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#fbfbfd] dark:to-black z-20 pointer-events-none" />

          {/* Heading and Search */}
          <motion.div 
            style={{ y: contentY }}
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
          </motion.div>

          {/* Minimal Scroll Hint */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0] }}
            transition={{ delay: 4, duration: 2, repeat: Infinity }}
            className="absolute bottom-12 z-40 flex flex-col items-center gap-4 cursor-pointer"
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          >
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-600">Initialize Exploration</span>
             <div className="w-[1px] h-14 bg-gradient-to-b from-black dark:from-white to-transparent" />
          </motion.div>
        </section>

        {/* Capabilities Section */}
        <section className="relative py-32 px-6 flex flex-col items-center">
            {/* Header */}
            <div className="w-full max-w-5xl mb-24 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-8 border-b border-black/5 dark:border-white/5 pb-12">
                <div className="space-y-4">
                    <p className="text-[10px] uppercase tracking-[0.4em] font-black text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]">Core Architecture</p>
                    <h2 className="text-4xl sm:text-6xl font-black text-black dark:text-white tracking-tighter leading-[0.9]">
                        Mechanical <br /> Efficiency.
                    </h2>
                </div>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium max-w-xs text-sm sm:text-lg leading-relaxed tracking-tight">
                    Beyond traditional indexing. We operate at the intersection of neural resonance and raw mechanical speed.
                </p>
            </div>

            {/* Capability Grid */}
            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                {[
                    { 
                        title: "Neural Synthesis", 
                        desc: "Real-time RAG architecture that transforms queries into multidimensional intelligence mappings.", 
                        tag: "Resonance",
                        delay: 0
                    },
                    { 
                        title: "Global Indexing", 
                        desc: "Distributed consensus-based search mapping that reaches across the edge to resolve context.", 
                        tag: "Consensus",
                        delay: 0.2
                    },
                    { 
                        title: "Console Execution", 
                        desc: "Direct system interactions through Console Mode. Move at the speed of command lines.", 
                        tag: "Direct",
                        delay: 0.4
                    }
                ].map((cap, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: cap.delay, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="group relative p-8 sm:p-10 rounded-[2.5rem] bg-white dark:bg-zinc-900/40 border border-black/5 dark:border-white/5 shadow-xl overflow-hidden transition-all duration-700 hover:shadow-2xl hover:scale-[1.02]"
                    >
                        {/* Thermal Glow */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/5 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                        
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-600 border border-black/10 dark:border-white/10 px-3 py-1 rounded-full">
                                    {cap.tag}
                                </span>
                                <div className="w-2 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 group-hover:bg-red-500 transition-colors duration-500 shadow-[0_0_10px_red] shadow-transparent group-hover:shadow-red-500/50" />
                            </div>
                            <h3 className="text-2xl font-black text-black dark:text-white tracking-tight leading-none">{cap.title}</h3>
                            <p className="text-zinc-500 dark:text-zinc-500 text-sm leading-relaxed tracking-tight">{cap.desc}</p>
                            
                            <div className="pt-4 flex items-center gap-2">
                                <span className="w-8 h-[1px] bg-zinc-200 dark:bg-zinc-800 group-hover:w-16 group-hover:bg-red-500 transition-all duration-700" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-transparent group-hover:text-red-500 transition-all duration-700">Ready</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>


        <RiverFooter />
      </main>
    </>
  )
}
