'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LocationGreeting from './LocationGreeting'

/**
 * SiteLoader Component - Cinematic Location Greeting
 * Minimalist, high-end reveal focusing on the user's context.
 */

export default function SiteLoader() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Cinematic timing for the reveal
    const timer = setTimeout(() => {
      setLoading(false)
    }, 3200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            y: -20,
            transition: { duration: 1.5, ease: [0.16, 1, 0.3, 1] } 
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-white dark:bg-black"
        >
          {/* Subtle Dynamic Grain Overlay */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

          <div className="relative flex flex-col items-center">
            {/* The Greeting - Central Focus */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 1.8, ease: "easeOut" }}
              className="flex flex-col items-center gap-8"
            >
              <LocationGreeting />
              
              {/* Minimal Loading Pulse */}
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.8, ease: "easeInOut" }}
                className="h-[1px] bg-black dark:bg-white/40 max-w-[120px]"
              />
            </motion.div>

            {/* Preparation Text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.2 }}
              transition={{ delay: 2, duration: 1 }}
              className="absolute bottom-[-60px] whitespace-nowrap"
            >
              <span className="text-[10px] uppercase tracking-[0.6em] font-medium text-black dark:text-white">
                Initializing Intelligence
              </span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
