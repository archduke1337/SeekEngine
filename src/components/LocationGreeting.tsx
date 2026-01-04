'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

/**
 * LocationGreeting Component
 * Refined for cinematic SiteLoader integration.
 * Pure typography with high-density tracking.
 */

export default function LocationGreeting() {
  const [location, setLocation] = useState<string>('')
  const [timeOfDay, setTimeOfDay] = useState<string>('')

  useEffect(() => {
    // Determine time of day
    const hour = new Date().getHours()
    if (hour < 12) setTimeOfDay('morning')
    else if (hour < 18) setTimeOfDay('afternoon')
    else setTimeOfDay('evening')

    // Fetch IP-based location
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data.city) setLocation(data.city)
        else if (data.region) setLocation(data.region)
        else setLocation('your world')
      })
      .catch(() => setLocation('your world'))
  }, [])

  if (!timeOfDay) return null

  return (
    <motion.div 
      className="flex flex-col items-center gap-2"
    >
      <motion.span 
        initial={{ opacity: 0, letterSpacing: '0.4em' }}
        animate={{ opacity: 1, letterSpacing: '0.8em' }}
        transition={{ duration: 2, ease: "easeOut" }}
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
