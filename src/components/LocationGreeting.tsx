'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

/**
 * LocationGreeting Component
 * Refined for cinematic SiteLoader integration.
 * Pure typography with high-density tracking.
 */

export default function LocationGreeting() {
  const [location, setLocation] = useState<string>('your world')
  const [timeOfDay, setTimeOfDay] = useState<string>('')

  useEffect(() => {
    // Perceptual Correctness: Maintain accurate time-of-day logic
    const updateTime = () => {
      const hour = new Date().getHours()
      if (hour < 12) setTimeOfDay('morning')
      else if (hour < 18) setTimeOfDay('afternoon')
      else setTimeOfDay('evening')
    }

    updateTime()
    const timeInterval = setInterval(updateTime, 60_000)

    // Privacy & Reliability Hardening: Best-effort IP lookup with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 1200)

    fetch('https://ipapi.co/json/', { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        clearTimeout(timeoutId)
        // Guard against late responses after abort
        if (controller.signal.aborted) return
        if (data.city) setLocation(data.city)
        else if (data.region) setLocation(data.region)
      })
      .catch(() => {
        clearTimeout(timeoutId)
        // Silent failure defaults to 'your world' initialized above
      })

    return () => {
      clearInterval(timeInterval)
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [])

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
