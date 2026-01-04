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

const Hero3D = dynamic(() => import('../components/Hero3D'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-white dark:bg-black" />,
})

export default function Home() {
  const router = useRouter()
  const { scrollY } = useScroll()
  const [isTyping, setIsTyping] = useState(false)
  
  const blurValue = useTransform(scrollY, [0, 400], [0, 15])
  const opacityValue = useTransform(scrollY, [100, 400], [1, 0.15])
  const heroScale = useTransform(scrollY, [0, 500], [1, 1.3])
  const contentY = useTransform(scrollY, [0, 500], [0, -80])
  const backdropFilter = useMotionTemplate`blur(${blurValue}px)`

  return (
    <>
      <main className="min-h-screen flex flex-col bg-[#fbfbfd] dark:bg-[#000000] transition-colors duration-1000 overflow-x-hidden">
        
        {/* Dynamic Grid Overlay */}
        <div className="fixed inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] pointer-events-none" />

        {/* Hero Section */}
        <section className="relative h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
          <motion.div style={{ scale: heroScale, opacity: opacityValue }} className="absolute inset-0 z-0">
            <Hero3D isHighPower={isTyping} />
          </motion.div>

          <motion.div 
            style={{ backdropFilter, WebkitBackdropFilter: backdropFilter }}
            className="absolute inset-0 pointer-events-none z-10"
          />

          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#fbfbfd] dark:to-black z-20 pointer-events-none" />

          {/* Heading and Search */}
          <motion.div 
            style={{ y: contentY }}
            className="w-full max-w-5xl relative z-30 flex flex-col items-center gap-24"
          >
            <div className="text-center space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              >
                <h1 className="text-[14vw] sm:text-[10rem] font-black tracking-[-0.05em] text-black dark:text-white leading-none py-4 mb-2 select-none flex items-center justify-center gap-1 font-sans">
                  <span className="tracking-[-0.07em]">Seek</span>
                  <span className="relative inline-block">
                    <span className={`hot-engine-text italic font-medium transition-all duration-700 ${isTyping ? 'high-power' : ''}`}>Engine</span>
                    
                    {/* Visual Exhaust on text */}
                    <AnimatePresence>
                      {isTyping && (
                         <div className="absolute -top-12 inset-x-0 flex justify-center pointer-events-none">
                            {[1, 2, 3].map((i) => (
                              <motion.div
                                key={`text-smoke-${i}`}
                                initial={{ opacity: 0, y: 10, scale: 0.5 }}
                                animate={{ 
                                  opacity: [0, 0.4, 0], 
                                  y: [-10, -80], 
                                  scale: [1, 2.5], 
                                  x: [0, (i % 2 === 0 ? 15 : -15)] 
                                }}
                                transition={{ 
                                  duration: 1, 
                                  repeat: Infinity, 
                                  delay: i * 0.15,
                                  ease: "easeOut" 
                                }}
                                className="absolute w-12 h-12 bg-zinc-400/20 dark:bg-white/10 rounded-full blur-[15px]"
                              />
                            ))}
                         </div>
                      )}
                    </AnimatePresence>
                  </span>
                </h1>
                
                <p className="text-lg sm:text-2xl text-zinc-400 dark:text-zinc-500 font-medium max-w-2xl mx-auto leading-relaxed tracking-tight px-4 font-sans">
                  The future of discovery is not a list of links. <br className="hidden sm:block" />
                  It is a <span className="text-black dark:text-white font-bold opacity-100">synthesis of human intent.</span>
                </p>
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-2xl px-4 relative"
            >
              {/* Exhaust Smoke Particles */}
              <AnimatePresence>
                {isTyping && (
                  <div className="absolute -top-20 inset-x-0 flex justify-center pointer-events-none">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20, scale: 0.5, filter: 'blur(10px)' }}
                        animate={{ 
                          opacity: [0, 0.2, 0], 
                          y: [-20, -100 - (i * 20)], 
                          scale: [1, 2], 
                          x: [0, (i % 2 === 0 ? 20 : -20)] 
                        }}
                        transition={{ 
                          duration: 1.5, 
                          repeat: Infinity, 
                          delay: i * 0.2,
                          ease: "easeOut" 
                        }}
                        className="absolute w-20 h-20 bg-zinc-400/20 dark:bg-white/10 rounded-full blur-[20px]"
                      />
                    ))}
                  </div>
                )}
              </AnimatePresence>

              <div className={`p-1 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-3xl rounded-[2.8rem] border border-black/5 dark:border-white/5 shadow-2xl group transition-all duration-500 hover:shadow-black/5 ${isTyping ? 'engine-overdrive-shake' : 'engine-idle-shake'}`}>
                <SearchBar autoFocus onTyping={setIsTyping} />
              </div>
            </motion.div>
          </motion.div>

          {/* Minimal Scroll Hint */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0] }}
            transition={{ delay: 3, duration: 2, repeat: Infinity }}
            className="absolute bottom-12 z-40"
          >
             <div className="w-[1px] h-14 bg-gradient-to-b from-black dark:from-white to-transparent" />
          </motion.div>
        </section>


        <RiverFooter />
      </main>
    </>
  )
}
