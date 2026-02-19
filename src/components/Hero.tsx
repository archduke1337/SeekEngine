'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function Hero() {
  const { scrollY } = useScroll()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  // Parallax transforms
  const y1 = useTransform(scrollY, [0, 500], [0, 80])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])
  const scale = useTransform(scrollY, [0, 400], [1, 0.97])

  const isDark = mounted ? resolvedTheme === 'dark' : true

  return (
    <section className="w-full flex flex-col items-center justify-center relative overflow-visible pointer-events-none py-12">
      {/* Ambient Background - Multi-layered Glow */}
      <div className="absolute inset-0 overflow-visible flex items-center justify-center pointer-events-none z-0">
         {/* Primary glow */}
         <motion.div 
           animate={{ 
             scale: [1, 1.15, 1],
             opacity: [0.08, 0.16, 0.08],
           }}
           transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
           className="absolute w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full blur-[100px]"
           style={{
             background: isDark 
               ? 'radial-gradient(circle, rgba(59,130,246,0.25) 0%, rgba(139,92,246,0.15) 40%, transparent 70%)'
               : 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, rgba(139,92,246,0.06) 40%, transparent 70%)'
           }}
         />
         {/* Secondary accent */}
         <motion.div 
           animate={{ 
             scale: [1.1, 1, 1.1],
             opacity: [0.05, 0.12, 0.05],
             rotate: [0, 180, 360]
           }}
           transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
           className="absolute w-[35vw] h-[35vw] max-w-[400px] max-h-[400px] rounded-full blur-[80px]"
           style={{
             background: isDark
               ? 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 60%)'
               : 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 60%)'
           }}
         />
      </div>

      {/* HERO TYPOGRAPHY */}
      <motion.div 
         style={{ y: y1, scale }}
         className="relative z-10 text-center px-4 pointer-events-auto"
      >
        <div className="relative inline-block group">
          <h1 
            className="relative z-10 text-[13vw] sm:text-[10vw] md:text-[9vw] leading-[0.85] font-bold italic tracking-[-0.05em] select-none whitespace-nowrap"
            style={{
              fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
              backgroundImage: isDark 
                 ? 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.0) 100%)'
                 : 'linear-gradient(180deg, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.0) 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              WebkitTextStroke: isDark ? '1.5px rgba(255,255,255,0.55)' : '1.5px rgba(0,0,0,0.12)',
              textShadow: isDark
                ? '0 0 40px rgba(255,255,255,0.08), 0 0 80px rgba(59, 130, 246, 0.15)'
                : '0 8px 24px rgba(0,0,0,0.04)',
              filter: isDark ? 'drop-shadow(0 0 1px rgba(255,255,255,0.4))' : 'none'
            }}
          >
             SeekEngine
          </h1>
          
          {/* Subtle underline accent */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute -bottom-2 left-[10%] right-[10%] h-[1px] origin-left"
            style={{
              background: isDark
                ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)'
                : 'linear-gradient(90deg, transparent, rgba(0,0,0,0.08), transparent)'
            }}
          />
        </div>
      </motion.div>

      {/* TAGLINE */}
      <motion.div 
        style={{ opacity }}
        className="mt-10 md:mt-14 text-center space-y-4 z-20 relative max-w-2xl px-6 pointer-events-auto"
      >
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-lg md:text-xl font-normal transition-colors duration-300"
          style={{
             fontFamily: 'SF Pro Text, -apple-system, sans-serif',
             color: isDark ? '#86868b' : '#6e6e73',
             letterSpacing: '-0.01em'
          }}
        >
          The future of discovery is not a list of links.
        </motion.h2>
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-lg md:text-xl font-medium transition-colors duration-300"
           style={{
             fontFamily: 'SF Pro Text, -apple-system, sans-serif',
             color: isDark ? '#f5f5f7' : '#1D1D1F',
             letterSpacing: '-0.01em',
          }}
        >
          It is a{' '}
          <span 
            className="relative inline-block"
          >
            <span className="relative z-10">sensed synthesis of human intent.</span>
            <span 
              className="absolute bottom-0 left-0 right-0 h-[6px] -z-0 rounded-sm"
              style={{
                background: isDark 
                  ? 'linear-gradient(90deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))'
                  : 'linear-gradient(90deg, rgba(59,130,246,0.12), rgba(139,92,246,0.12))'
              }}
            />
          </span>
        </motion.h2>
      </motion.div>
    </section>
  )
}
