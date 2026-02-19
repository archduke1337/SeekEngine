'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState, useMemo, useCallback } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'

/* Floating ambient orbs */
function GradientOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        animate={{ x: [0, 30, -20, 0], y: [0, -30, 10, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full opacity-30 blur-[120px]"
        style={{ background: 'radial-gradient(circle, var(--gradient-from), transparent 70%)' }}
      />
      <motion.div
        animate={{ x: [0, -30, 20, 0], y: [0, 20, -30, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full opacity-20 blur-[100px]"
        style={{ background: 'radial-gradient(circle, var(--gradient-via), transparent 70%)' }}
      />
      <motion.div
        animate={{ x: [0, 20, -10, 0], y: [0, -20, 20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full opacity-10 blur-[80px]"
        style={{ background: 'radial-gradient(circle, var(--gradient-to), transparent 70%)' }}
      />
    </div>
  )
}

/* Dot grid pattern background */
function DotPattern() {
  return (
    <div className="absolute inset-0 dot-grid opacity-50 pointer-events-none" />
  )
}

/* Floating particles */
function FloatingParticles() {
  const particles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1.5,
      delay: Math.random() * 5,
      duration: Math.random() * 10 + 10,
    })), []
  )

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: `hsl(var(--primary) / 0.4)`,
          }}
          animate={{
            y: [0, -40, 0],
            opacity: [0, 0.6, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

/* Rotating status badges */
function StatusBadge() {
  const labels = ['AI-Powered', 'Neural Search', 'Real-Time', 'Grounded']
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setIdx(i => (i + 1) % labels.length), 2800)
    return () => clearInterval(interval)
  }, [labels.length])

  return (
    <motion.div
      key={idx}
      initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide border"
      style={{
        background: 'hsl(var(--primary) / 0.06)',
        borderColor: 'hsl(var(--primary) / 0.12)',
        color: 'hsl(var(--primary))',
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {labels[idx]}
    </motion.div>
  )
}

export default function Hero() {
  const { scrollY } = useScroll()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const y1 = useTransform(scrollY, [0, 500], [0, 80])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])
  const scale = useTransform(scrollY, [0, 400], [1, 0.97])

  return (
    <section className="w-full flex flex-col items-center justify-center relative overflow-visible pointer-events-none py-8 sm:py-12">
      
      {/* Background effects */}
      <GradientOrbs />
      <DotPattern />
      <FloatingParticles />

      {/* HERO CONTENT */}
      <motion.div
        style={{ y: y1, scale }}
        className="relative z-10 text-center px-4 pointer-events-auto flex flex-col items-center"
      >
        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="mb-6"
        >
          <StatusBadge />
        </motion.div>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 sm:mb-8 relative"
        >
          <div className="relative">
            <Image
              src="/logo.png"
              alt="SeekEngine"
              width={80}
              height={80}
              className="w-16 h-16 sm:w-20 sm:h-20"
              priority
            />
            {/* Gradient glow behind logo */}
            <div 
              className="absolute inset-0 blur-[24px] opacity-40 rounded-full"
              style={{ background: 'var(--gradient-from)' }}
            />
          </div>
        </motion.div>

        {/* Title */}
        <div className="relative inline-block group">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 text-[12vw] sm:text-[8vw] md:text-[7vw] leading-[0.9] font-extrabold tracking-[-0.04em] select-none gradient-text"
          >
            SeekEngine
          </motion.h1>

          {/* Gradient underline */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute -bottom-2 left-[5%] right-[5%] h-[2px] origin-left rounded-full"
            style={{
              background: 'linear-gradient(90deg, transparent, var(--gradient-from), var(--gradient-via), var(--gradient-to), transparent)',
            }}
          />
        </div>
      </motion.div>

      {/* TAGLINE */}
      <motion.div
        style={{ opacity }}
        className="mt-8 md:mt-12 text-center space-y-3 z-20 relative max-w-2xl px-6 pointer-events-auto"
      >
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-base md:text-lg font-light text-muted-foreground"
          style={{ letterSpacing: '-0.01em' }}
        >
          The future of discovery is not a list of links.
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-base md:text-lg font-medium text-foreground"
          style={{ letterSpacing: '-0.01em' }}
        >
          It is a{' '}
          <span className="gradient-text font-semibold">
            sensed synthesis
          </span>
          {' '}of human intent.
        </motion.p>
      </motion.div>
    </section>
  )
}
