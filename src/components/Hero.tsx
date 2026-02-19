'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState, useMemo } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'

/* Animated grid lines background */
function RetroGrid({ isDark }: { isDark: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Horizontal grid lines */}
      <div className="absolute inset-0" style={{
        backgroundImage: `
          linear-gradient(${isDark ? 'rgba(0,255,240,0.04)' : 'rgba(0,144,255,0.06)'} 1px, transparent 1px),
          linear-gradient(90deg, ${isDark ? 'rgba(0,255,240,0.04)' : 'rgba(0,144,255,0.06)'} 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }} />
      {/* Perspective fade */}
      <div className="absolute inset-0" style={{
        background: isDark 
          ? 'radial-gradient(ellipse at center, transparent 30%, #0a0a0f 75%)'
          : 'radial-gradient(ellipse at center, transparent 30%, #f0f0f5 75%)'
      }} />
    </div>
  )
}

/* Floating data fragments */
function DataParticles({ isDark }: { isDark: boolean }) {
  const particles = useMemo(() => 
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 5,
      duration: Math.random() * 10 + 8,
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
            background: isDark ? 'rgba(0,255,240,0.3)' : 'rgba(0,144,255,0.3)',
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 0.8, 0],
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

/* Status readout cycling text */
function StatusReadout({ isDark }: { isDark: boolean }) {
  const statuses = [
    'NEURAL_MESH: ONLINE',
    'INDEX_DEPTH: ∞',
    'QUERY_ENGINE: ARMED',
    'LATENCY: <1ms',
    'SYNTHESIS: ACTIVE',
  ]
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setIdx(i => (i + 1) % statuses.length), 2400)
    return () => clearInterval(interval)
  }, [statuses.length])

  return (
    <motion.div
      key={idx}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="font-mono text-[10px] sm:text-xs tracking-[0.3em] uppercase"
      style={{ color: isDark ? 'rgba(0,255,240,0.5)' : 'rgba(0,144,255,0.6)' }}
    >
      {'>'} {statuses[idx]}
      <span className="animate-terminal-blink ml-1">_</span>
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

  const isDark = mounted ? resolvedTheme === 'dark' : true

  return (
    <section className="w-full flex flex-col items-center justify-center relative overflow-visible pointer-events-none py-8 sm:py-12">
      
      {/* RETRO GRID BACKGROUND */}
      <RetroGrid isDark={isDark} />
      <DataParticles isDark={isDark} />

      {/* SCANLINE OVERLAY */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        <motion.div
          animate={{ y: ['0%', '200%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="absolute left-0 right-0 h-[2px]"
          style={{
            background: isDark 
              ? 'linear-gradient(90deg, transparent, rgba(0,255,240,0.07), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(0,144,255,0.06), transparent)',
            top: '-100%',
          }}
        />
      </div>

      {/* HERO CONTENT */}
      <motion.div
        style={{ y: y1, scale }}
        className="relative z-10 text-center px-4 pointer-events-auto flex flex-col items-center"
      >
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
            {/* Glow behind logo */}
            <div 
              className="absolute inset-0 blur-[20px] opacity-30 rounded-full"
              style={{ background: isDark ? 'rgba(0,255,240,0.4)' : 'rgba(0,144,255,0.3)' }}
            />
          </div>
        </motion.div>

        {/* Title */}
        <div className="relative inline-block group">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 text-[12vw] sm:text-[8vw] md:text-[7vw] leading-[0.9] font-bold tracking-[-0.04em] select-none whitespace-nowrap font-display"
            style={{
              color: isDark ? '#e0e0e8' : '#0a0a14',
              textShadow: isDark
                ? '0 0 40px rgba(0,255,240,0.15), 0 0 80px rgba(0,255,240,0.08)'
                : '0 0 40px rgba(0,144,255,0.1)',
            }}
          >
            SeekEngine
          </motion.h1>

          {/* Neon underline */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute -bottom-2 left-[5%] right-[5%] h-[2px] origin-left"
            style={{
              background: isDark
                ? 'linear-gradient(90deg, transparent, #00fff0, transparent)'
                : 'linear-gradient(90deg, transparent, #0090ff, transparent)',
              boxShadow: isDark
                ? '0 0 10px rgba(0,255,240,0.3), 0 0 20px rgba(0,255,240,0.1)'
                : '0 0 10px rgba(0,144,255,0.2)',
            }}
          />
        </div>

        {/* Status readout */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 sm:mt-8"
        >
          <StatusReadout isDark={isDark} />
        </motion.div>
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
          className="text-base md:text-lg font-display font-light"
          style={{ color: isDark ? '#6b6b80' : '#6b6b80', letterSpacing: '-0.01em' }}
        >
          The future of discovery is not a list of links.
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-base md:text-lg font-display font-medium"
          style={{ color: isDark ? '#e0e0e8' : '#0a0a14', letterSpacing: '-0.01em' }}
        >
          It is a{' '}
          <span className="relative inline-block">
            <span className="relative z-10" style={{ 
              color: isDark ? '#00fff0' : '#0090ff',
              textShadow: isDark ? '0 0 12px rgba(0,255,240,0.3)' : 'none',
            }}>
              sensed synthesis
            </span>
          </span>
          {' '}of human intent.
        </motion.p>
      </motion.div>
    </section>
  )
}
