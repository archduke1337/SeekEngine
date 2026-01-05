import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function Hero() {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
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
    <section className="h-screen flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* 
         HERO TYPOGRAPHY - APPLE STYLE
         Solid colors. Tight tracking. No gimmicks.
      */}
      <motion.div 
         style={{ y: y1 }}
         className="relative z-10 text-center px-4"
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
        className="mt-8 md:mt-12 text-center space-y-3 z-20 relative max-w-2xl px-6"
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

      {/* SEARCH BAR - Spotlight Style */}
      <div className="absolute bottom-12 md:bottom-24 w-full max-w-[600px] px-6 z-30">
        <div 
          className={`
             relative group transition-all duration-300 ease-out
             ${isFocused ? 'scale-[1.02]' : 'scale-100'}
          `}
        >
          {/* Glass Container */}
          <div 
            className="rounded-full flex items-center p-2 shadow-2xl backdrop-blur-2xl border transition-colors duration-300"
            style={{
               background: isDark ? 'rgba(28, 28, 30, 0.7)' : 'rgba(255, 255, 255, 0.8)',
               borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
               boxShadow: isDark ? '0 20px 40px -10px rgba(0,0,0,0.5)' : '0 20px 40px -10px rgba(0,0,0,0.1)'
            }}
          >
            
            {/* Search Icon */}
            <div className="pl-4 pr-3 text-secondary">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isDark ? "rgba(235,235,245,0.6)" : "rgba(60,60,67,0.6)"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
               </svg>
            </div>

            <input 
              type="text" 
              placeholder="Search intelligence index..."
              className={`w-full bg-transparent border-none text-[19px] h-12 focus:ring-0 outline-none placeholder:font-normal ${
                isDark ? 'placeholder:text-[rgba(235,235,245,0.3)]' : 'placeholder:text-[rgba(60,60,67,0.3)]'
              }`}
              style={{
                 fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                 color: isDark ? '#FFFFFF' : '#000000',
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              spellCheck={false}
            />

            {/* Action Button */}
            <div className="pr-2">
               <button 
                 className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
                 style={{ 
                    background: isDark ? '#3A3A3C' : '#E5E5EA',
                    opacity: query ? 1 : 0
                 }}
               >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isDark ? "#FFF" : "#000"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                     <line x1="5" y1="12" x2="19" y2="12"></line>
                     <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
               </button>
            </div>
          </div>
        </div>
      </div>

    </section>
  )
}
