'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useLocation } from '../../hooks/useLocation'

/**
 * LocationGreeting Component
 * Refined for cinematic SiteLoader integration.
 * Pure typography with high-density tracking.
 */

export default function LocationGreeting() {
  const { location, timeOfDay } = useLocation()

  if (!timeOfDay) return null

  return (
    <motion.div 
      className="flex flex-col items-center gap-2"
      aria-live="polite"
      aria-atomic="true"
    >
      <motion.span 
        initial={{ opacity: 0, letterSpacing: '0.4em' }}
        animate={{ opacity: 1, letterSpacing: '0.8em' }}
        transition={{ 
          opacity: { duration: 1.2 },
          letterSpacing: { duration: 2, ease: [0.16, 1, 0.3, 1] } 
        }}
        className="text-[11px] text-black dark:text-white font-black uppercase"
      >
        Good {timeOfDay}
      </motion.span>
      <motion.span 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 1, duration: 1.5 }}
        className="text-[9px] text-black dark:text-white font-medium uppercase tracking-[0.4em]"
      >
        Connecting from {location}
      </motion.span>
    </motion.div>
  )
}
