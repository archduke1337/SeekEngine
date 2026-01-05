import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function Hero() {
  const { scrollY } = useScroll()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), [])

  // Parallax for the big text
  const y1 = useTransform(scrollY, [0, 500], [0, 100])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])

  const isDark = mounted ? resolvedTheme === 'dark' : true

  return (
    <section className="w-full flex flex-col items-center justify-center relative overflow-visible pointer-events-none py-12">
      {/* Ambient Background Glow - Stronger Deep Glow */}
      <div className="absolute inset-0 overflow-visible flex items-center justify-center pointer-events-none z-0">
         <motion.div 
           animate={{ 
             scale: [1, 1.2, 1],
             opacity: [0.1, 0.2, 0.1],
             rotate: [0, 90, 0]
           }}
           transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
           className="w-[40vw] h-[40vw] rounded-full bg-gradient-to-tr from-blue-600/20 via-indigo-500/15 to-purple-600/20 blur-[80px] mix-blend-normal dark:mix-blend-screen"
         />
      </div>

      {/* 
         HERO TYPOGRAPHY - ULTRA GLASS
      */}
      <motion.div 
         style={{ y: y1 }}
         className="relative z-10 text-center px-4 pointer-events-auto"
      >
        <div className="relative inline-block group">
          
          {/* MAIN TEXT LAYER */}
          <h1 
            className="relative z-10 text-[12vw] sm:text-[10vw] leading-[0.9] font-bold italic tracking-[-0.04em] select-none whitespace-nowrap animate-text-shimmer bg-[size:200%_auto]"
            style={{
              fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
              
              // 1. ANIMATED GLASS BODY (Shimmer is here)
              backgroundImage: isDark 
                 ? 'linear-gradient(110deg, rgba(255,255,255,0.0) 45%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.0) 55%)'
                 : 'linear-gradient(110deg, rgba(0,0,0,0.05) 45%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.05) 55%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              
              // 2. THE RIM (Physical Edge)
              WebkitTextStroke: isDark ? '1.5px rgba(255,255,255,0.6)' : '1.5px rgba(0,0,0,0.15)',
              
              // 3. THE GLOW (Emanating Light)
              textShadow: isDark
                ? `
                   0 0 30px rgba(255,255,255,0.1),
                   0 0 60px rgba(59, 130, 246, 0.2)
                  `
                : '0 10px 30px rgba(0,0,0,0.05)',
                
              filter: isDark ? 'drop-shadow(0 0 1px rgba(255,255,255,0.5))' : 'none'
            }}
          >
             SeekEngine
          </h1>
        </div>
      </motion.div>

      {/* SUBTEXT / TAGLINE */}
      <motion.div 
        style={{ opacity }}
        className="mt-8 md:mt-12 text-center space-y-3 z-20 relative max-w-2xl px-6 pointer-events-auto"
      >
        <h2 
          className="text-xl md:text-2xl font-normal transition-colors duration-300"
          style={{
             fontFamily: 'SF Pro Text, -apple-system, sans-serif',
             color: isDark ? '#86868b' : '#6e6e73', // Apple Secondary Text
             letterSpacing: '-0.01em'
          }}
        >
          The future of discovery is not a list of links.
        </h2>
        <h2 
          className="text-xl md:text-2xl font-medium transition-colors duration-300"
           style={{
             fontFamily: 'SF Pro Text, -apple-system, sans-serif',
             color: isDark ? '#ffffff' : '#1D1D1F', // Brighter white for dark mode
             letterSpacing: '-0.01em',
             textShadow: isDark ? '0 0 20px rgba(255,255,255,0.2)' : 'none'
          }}
        >
          It is a <span className="border-b-2" style={{ borderColor: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.1)' }}>sensed synthesis of human intent.</span>
        </h2>
      </motion.div>

    </section>
  )
}
