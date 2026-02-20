'use client'

/**
 * CanvasCrowd Footer — Inspired by Skiper UI Canvas Crowd (skiper39)
 * Procedural crowd animation with GSAP and Canvas API
 * Creates a living, breathing crowd of abstract figures
 */

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

interface Figure {
  x: number
  y: number
  scale: number
  color: string
  headRadius: number
  bodyWidth: number
  bodyHeight: number
  phase: number
  speed: number
  swayAmount: number
}

const COLORS_LIGHT = ['#1a1a1a', '#2a2a2a', '#3a3a3a', '#4a4a4a', '#5a5a5a', '#6a6a6a']
const COLORS_DARK = ['#d4d4d4', '#c4c4c4', '#b4b4b4', '#a4a4a4', '#949494', '#848484']

export default function CanvasCrowd({ isDark = false }: { isDark?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const figuresRef = useRef<Figure[]>([])
  const isVisibleRef = useRef(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let w: number, h: number
    const colors = isDark ? COLORS_DARK : COLORS_LIGHT

    const setCanvasSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.parentElement?.clientWidth || window.innerWidth
      h = 180
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const createFigures = () => {
      const count = Math.floor(w / 22)
      figuresRef.current = Array.from({ length: count }, (_, i) => ({
        x: (i / count) * w + (Math.random() - 0.5) * 14,
        y: h - 20 - Math.random() * 30,
        scale: 0.6 + Math.random() * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        headRadius: 4 + Math.random() * 3,
        bodyWidth: 8 + Math.random() * 6,
        bodyHeight: 20 + Math.random() * 15,
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.5,
        swayAmount: 1 + Math.random() * 2,
      }))
    }

    const drawFigure = (f: Figure, time: number) => {
      const sway = Math.sin(time * f.speed + f.phase) * f.swayAmount
      const breathe = Math.sin(time * f.speed * 0.5 + f.phase) * 0.5

      ctx.save()
      ctx.translate(f.x + sway, f.y)
      ctx.scale(f.scale, f.scale)
      ctx.globalAlpha = 0.6 + Math.sin(time * 0.2 + f.phase) * 0.15

      // Body (rounded rectangle)
      ctx.fillStyle = f.color
      const bx = -f.bodyWidth / 2
      const by = -f.bodyHeight
      const bw = f.bodyWidth
      const bh = f.bodyHeight + breathe
      const r = 4
      ctx.beginPath()
      ctx.moveTo(bx + r, by)
      ctx.lineTo(bx + bw - r, by)
      ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + r)
      ctx.lineTo(bx + bw, by + bh)
      ctx.lineTo(bx, by + bh)
      ctx.lineTo(bx, by + r)
      ctx.quadraticCurveTo(bx, by, bx + r, by)
      ctx.fill()

      // Head (circle)
      ctx.beginPath()
      ctx.arc(0, by - f.headRadius - 2, f.headRadius, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    }

    const render = (time: number) => {
      if (!isVisibleRef.current) {
        animationId = requestAnimationFrame(render)
        return
      }

      ctx.clearRect(0, 0, w, h)

      // Ground line subtle
      ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, h - 10)
      ctx.lineTo(w, h - 10)
      ctx.stroke()

      const t = time * 0.001
      figuresRef.current.forEach(f => drawFigure(f, t))

      animationId = requestAnimationFrame(render)
    }

    setCanvasSize()
    createFigures()

    // Stagger entrance animation with GSAP
    gsap.fromTo(
      figuresRef.current.map((_, i) => i),
      {},
      {
        duration: 0,
        onStart: () => {
          figuresRef.current.forEach((f, i) => {
            const origY = f.y
            f.y = h + 50
            gsap.to(f, {
              y: origY,
              duration: 0.8 + Math.random() * 0.6,
              delay: i * 0.015,
              ease: 'back.out(1.2)',
            })
          })
        },
      }
    )

    animationId = requestAnimationFrame(render)

    let resizeRaf: number
    const handleResize = () => {
      cancelAnimationFrame(resizeRaf)
      resizeRaf = requestAnimationFrame(() => {
        setCanvasSize()
        createFigures()
      })
    }

    window.addEventListener('resize', handleResize)
    return () => {
      cancelAnimationFrame(animationId)
      cancelAnimationFrame(resizeRaf)
      window.removeEventListener('resize', handleResize)
    }
  }, [isDark])

  // Intersection observer for visibility
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const observer = new IntersectionObserver(
      ([entry]) => { isVisibleRef.current = entry.isIntersecting },
      { threshold: 0.1 }
    )
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [])

  return (
    <footer className="relative w-full overflow-hidden">
      {/* Gradient fade at top */}
      <div className="absolute top-0 left-0 right-0 h-16 z-10 pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, hsl(var(--background)), transparent)`
        }}
      />

      <canvas
        ref={canvasRef}
        className="w-full block"
        style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.8s ease' }}
      />

      {/* Footer content */}
      <div className="relative z-20 -mt-4 pb-6 px-6 flex flex-col items-center gap-3">
        <div className="flex items-center gap-8 text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground/40">
          <span>SeekEngine</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/20" />
          <span>&copy; {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="https://archduke.is-a.dev" target="_blank" rel="noopener noreferrer"
            className="text-[10px] tracking-wider uppercase text-muted-foreground/30 hover:text-foreground transition-colors">
            Developer
          </a>
          <a href="https://github.com/archduke1337/SeekEngine" target="_blank" rel="noopener noreferrer"
            className="text-[10px] tracking-wider uppercase text-muted-foreground/30 hover:text-foreground transition-colors">
            Source
          </a>
        </div>
      </div>
    </footer>
  )
}
