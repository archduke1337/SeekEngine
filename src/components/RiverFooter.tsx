import React, { useEffect, useRef, useState } from 'react'

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
      { amplitude: 15, frequency: 0.01, speed: 0.02, color: 'rgba(71, 85, 105, 0.1)' },
      { amplitude: 10, frequency: 0.02, speed: -0.015, color: 'rgba(148, 163, 184, 0.08)' },
      { amplitude: 20, frequency: 0.005, speed: 0.01, color: 'rgba(15, 23, 42, 0.05)' },
      { amplitude: 8, frequency: 0.03, speed: 0.04, color: 'rgba(239, 68, 68, 0.03)' }
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

  if (!mounted) return null

  return (
    <footer className="relative w-full h-[180px] overflow-hidden mt-2 border-t border-black/5 dark:border-white/5">
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 opacity-50" 
        aria-hidden="true"
        role="presentation"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-black via-transparent to-transparent" />
      
      {/* Footer Content Overlay */}
      <div className="absolute bottom-10 left-0 right-0 px-8 flex flex-col items-center gap-4">
        <div className="flex items-center gap-3 py-2 px-4 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 backdrop-blur-md">
            <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">
                Operating in Global Network
            </span>
        </div>
        
        <div className="text-[10px] font-bold tracking-[0.4em] uppercase text-zinc-400 dark:text-zinc-500">
          SeekEngine 2026 
        </div>
      </div>
    </footer>
  )
}
