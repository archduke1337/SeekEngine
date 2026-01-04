import React, { useEffect, useRef, useState } from 'react'

/**
 * RiverFooter Component
 * An animated, flowing river effect using Canvas API
 */

export default function RiverFooter() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [location, setLocation] = useState<string>('Global Network')
  const [mounted, setMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Fetch Location
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data.city && data.country_name) {
          setLocation(`${data.city}, ${data.country_name}`)
        }
      })
      .catch(() => setLocation('Global Network'))

    const canvas = canvasRef.current
    if (!canvas) return
    
    // Performance Optimization: Only render when visible
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting)
    }, { threshold: 0.1 })
    
    observer.observe(canvas)

    let animationFrameId: number
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = (canvas.width = window.innerWidth)
    let h = (canvas.height = 150)

    const waves = [
      { amplitude: 15, frequency: 0.01, speed: 0.02, color: 'rgba(71, 85, 105, 0.1)' },
      { amplitude: 10, frequency: 0.02, speed: -0.015, color: 'rgba(148, 163, 184, 0.08)' },
      { amplitude: 20, frequency: 0.005, speed: 0.01, color: 'rgba(15, 23, 42, 0.05)' },
      { amplitude: 8, frequency: 0.03, speed: 0.04, color: 'rgba(239, 68, 68, 0.03)' }
    ]

    let offset = 0

    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render)
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

    const handleResize = () => {
      w = (canvas.width = window.innerWidth)
      h = (canvas.height = 150)
    }

    window.addEventListener('resize', handleResize)
    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      observer.disconnect()
    }
  }, [isVisible])

  if (!mounted) return null

  return (
    <footer className="relative w-full h-[180px] overflow-hidden mt-2 border-t border-black/5 dark:border-white/5">
      <canvas ref={canvasRef} className="absolute inset-0 opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-black via-transparent to-transparent" />
      
      {/* Footer Content Overlay */}
      <div className="absolute bottom-10 left-0 right-0 px-8 flex flex-col items-center gap-4">
        <div className="flex items-center gap-3 py-2 px-4 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 backdrop-blur-md">
            <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">
                Operating in {location}
            </span>
        </div>
        
        <div className="text-[10px] font-bold tracking-[0.4em] uppercase text-zinc-400 dark:text-zinc-500">
          SeekEngine 2026 
        </div>
      </div>
    </footer>
  )
}
