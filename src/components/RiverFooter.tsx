'use client'

import React, { useEffect, useRef } from 'react'

/**
 * RiverFooter Component
 * An animated, flowing river effect using Canvas API
 * Mimics a low-contrast stream of particles/waves for a premium feel
 */

export default function RiverFooter() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let w = (canvas.width = window.innerWidth)
    let h = (canvas.height = 150)

    const waves = [
      { amplitude: 15, frequency: 0.01, speed: 0.02, color: 'rgba(71, 85, 105, 0.1)' }, // Slate
      { amplitude: 10, frequency: 0.02, speed: -0.015, color: 'rgba(148, 163, 184, 0.08)' }, // Slate Light
      { amplitude: 20, frequency: 0.005, speed: 0.01, color: 'rgba(15, 23, 42, 0.05)' }, // Slate Deep
      { amplitude: 8, frequency: 0.03, speed: 0.04, color: 'rgba(239, 68, 68, 0.03)' } // Thermal Resonance (Red)
    ]

    let offset = 0

    const render = () => {
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
    }
  }, [])

  return (
    <footer className="relative w-full h-[150px] overflow-hidden pointer-events-none mt-20">
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-black via-transparent to-transparent" />
      
      {/* Footer Content Overlay */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-[0.4em] uppercase text-zinc-400 dark:text-zinc-600">
        SeekEngine © 2026
      </div>
    </footer>
  )
}
