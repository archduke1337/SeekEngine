'use client'

import React, { useEffect, useRef, useState } from 'react'
import LivingIcon from './LivingIcon'

/**
 * RiverFooter Component
 * An animated, flowing river effect using Canvas API.
 * High-performance ambient motion with proper lifecycle management.
 */

export default function RiverFooter() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mounted, setMounted] = useState(false)
  const isVisibleRef = useRef(false)

  // Architectural Hardening: Separate setup from visibility tracking
  useEffect(() => {
    setMounted(true)

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let w: number, h: number
    let offset = 0

    const waves = [
      { amplitude: 15, frequency: 0.01, speed: 0.02, color: '#3b82f61a' }, // Blue-ish
      { amplitude: 10, frequency: 0.02, speed: -0.015, color: '#8b5cf614' }, // Purple-ish
      { amplitude: 20, frequency: 0.005, speed: 0.01, color: '#10b9810d' },  // Emerald-ish
      { amplitude: 8, frequency: 0.03, speed: 0.04, color: '#ef444408' }     // Red-ish
    ]

    const setCanvasSize = () => {
      // Performance Polish: Handle High-DPI screens
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      w = window.innerWidth
      h = 150
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.scale(dpr, dpr)
    }

    const render = () => {
      // Visibility Throttling: If not visible, slow down the loop to save battery
      if (!isVisibleRef.current) {
        animationFrameId = setTimeout(() => {
            requestAnimationFrame(render)
        }, 250) as unknown as number
        return
      }
      
      ctx.clearRect(0, 0, w, h)
      offset += 1

      waves.forEach(wave => {
        ctx.beginPath()
        ctx.moveTo(0, h)

        for (let x = 0; x <= w; x += 10) {
          const y = h / 2 + Math.sin(x * wave.frequency + offset * wave.speed) * wave.amplitude
          ctx.lineTo(x, y)
        }

        ctx.lineTo(w, h)
        ctx.fillStyle = wave.color
        ctx.fill()
      })

      animationFrameId = requestAnimationFrame(render)
    }

    let resizeRaf: number
    const handleResize = () => {
      cancelAnimationFrame(resizeRaf)
      resizeRaf = requestAnimationFrame(setCanvasSize)
    }

    setCanvasSize()
    render()

    window.addEventListener('resize', handleResize)
    return () => {
      cancelAnimationFrame(animationFrameId)
      clearTimeout(animationFrameId) // handle the timeout variant
      cancelAnimationFrame(resizeRaf)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Visibility Observer: Attached once
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const observer = new IntersectionObserver(([entry]) => {
      isVisibleRef.current = entry.isIntersecting
    }, { threshold: 0.1 })
    
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [])

  // Location State
  const [location, setLocation] = useState('San Francisco, CA')

  useEffect(() => {
    // Attempt to fetch user location for personalized "System Active" status
    const fetchLocation = async () => {
        try {
            const res = await fetch('https://ipapi.co/json/')
            if (res.ok) {
                const data = await res.json()
                if (data.city && data.region_code) {
                    setLocation(`${data.city}, ${data.region_code}`)
                }
            }
        } catch (e) {
            // Fallback cleanly
            console.log('Using default system location')
        }
    }
    fetchLocation()
  }, [])

  if (!mounted) return null

  return (
    <footer className="relative w-full h-[180px] overflow-hidden mt-auto border-t border-black/5 dark:border-white/5 bg-[#fbfbfd] dark:bg-[#050505] z-0">
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 opacity-50" 
        aria-hidden="true"
        role="presentation"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-black via-transparent to-transparent" />
      
      {/* Footer Content Overlay */}
      <div className="absolute bottom-6 left-0 right-0 px-8 flex flex-col items-center gap-5">
        <div className="flex items-center gap-3 py-2.5 px-5 rounded-full bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/5 backdrop-blur-xl shadow-sm transition-all hover:bg-white/80 dark:hover:bg-zinc-800/80 cursor-default">
            <LivingIcon color="bg-emerald-500" size="w-2 h-2" className="mr-0.5" />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-600 dark:text-zinc-400">
                Data Stream Active • {location}
            </span>
        </div>
        
        <div className="flex gap-6 text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-300 dark:text-zinc-600">
          <a href="#" className="hover:text-zinc-500 dark:hover:text-zinc-400 transition-colors">Manifesto</a>
          <span>//</span>
          <a href="#" className="hover:text-zinc-500 dark:hover:text-zinc-400 transition-colors">System</a>
          <span>//</span>
          <a href="#" className="hover:text-zinc-500 dark:hover:text-zinc-400 transition-colors">Privacy</a>
        </div>
      </div>
    </footer>
  )
}
