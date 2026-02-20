'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

/**
 * ResultsFooter — Minimal footer for the search results page
 * Features location-based greeting with time-of-day awareness
 */
export default function ResultsFooter() {
  const [location, setLocation] = useState<string>('your world')
  const [timeOfDay, setTimeOfDay] = useState<string>('')

  useEffect(() => {
    const updateTime = () => {
      const hour = new Date().getHours()
      if (hour < 12) setTimeOfDay('morning')
      else if (hour < 18) setTimeOfDay('afternoon')
      else setTimeOfDay('evening')
    }

    updateTime()
    const timeInterval = setInterval(updateTime, 60_000)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 1200)

    fetch('https://ipapi.co/json/', { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        clearTimeout(timeoutId)
        if (controller.signal.aborted) return
        if (data.city) setLocation(data.city)
        else if (data.region) setLocation(data.region)
      })
      .catch(() => {
        clearTimeout(timeoutId)
      })

    return () => {
      clearInterval(timeInterval)
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [])

  return (
    <footer className="w-full border-t border-border/10 mt-16 pt-8 pb-10">
      <div className="max-w-5xl mx-auto px-6 flex flex-col items-center gap-5">
        {/* Location greeting */}
        {timeOfDay && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-1.5"
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.5em] text-muted-foreground/30">
              Good {timeOfDay}
            </span>
            <span className="text-[9px] font-medium uppercase tracking-[0.3em] text-muted-foreground/20">
              Connecting from {location}
            </span>
          </motion.div>
        )}

        {/* Footer links */}
        <div className="flex items-center gap-6 text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground/25">
          <span>SeekEngine</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/15" />
          <span>&copy; {new Date().getFullYear()}</span>
        </div>

        <div className="flex items-center gap-5">
          <a
            href="https://archduke.is-a.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] tracking-wider uppercase text-muted-foreground/20 hover:text-foreground/50 transition-colors"
          >
            Developer
          </a>
          <a
            href="https://github.com/archduke1337/SeekEngine"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] tracking-wider uppercase text-muted-foreground/20 hover:text-foreground/50 transition-colors"
          >
            Source
          </a>
        </div>
      </div>
    </footer>
  )
}
