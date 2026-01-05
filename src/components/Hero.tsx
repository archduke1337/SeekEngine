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
      
      {/* 
         HERO TYPOGRAPHY - APPLE STYLE
         Solid colors. Tight tracking. No gimmicks.
      */}
      <motion.div 
         style={{ y: y1 }}
         className="relative z-10 text-center px-4 pointer-events-auto"
      >
        <div className="relative">
          {/* 
            Safe "Glass" via Text Shadows 
            NO background-clip used to guarantee no rectangle artifacts.
          */}
          <h1 
            className="text-[12vw] sm:text-[10vw] leading-[0.9] font-bold italic tracking-[-0.04em] select-none whitespace-nowrap transition-all duration-500"
            style={{
              fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
              
              // 1. Semi-transparent fill (The "Glass Body")
              color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              
              // 2. The Rim (Physical Edge)
              WebkitTextStroke: isDark ? '1.5px rgba(255,255,255,0.5)' : '1px rgba(0,0,0,0.2)',
              
              // 3. The Frost/Glow (Simulated Volume via Shadow)
              textShadow: isDark
                ? `
                   0 0 5px rgba(255,255,255,0.2), 
                   0 0 10px rgba(255,255,255,0.1), 
                   0 0 20px rgba(255,255,255,0.1)
                  `
                : '0 5px 15px rgba(0,0,0,0.1)',
                
              display: 'inline-block',
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
             color: isDark ? '#F5F5F7' : '#1D1D1F', // Apple Primary Text
             letterSpacing: '-0.01em'
          }}
        >
          It is a <span className="border-b-2" style={{ borderColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)' }}>sensed synthesis of human intent.</span>
        </h2>
      </motion.div>

    </section>
  )
}
