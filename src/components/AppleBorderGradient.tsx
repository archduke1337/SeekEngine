'use client'

/**
 * AppleBorderGradient — iOS Apple Intelligence viewport border glow
 * Reference: skiper-ui.com/v1/skiper86
 * 
 * Quad-layered edge beams (hot core + bright bloom + soft glow + deep haze),
 * vivid corner + midpoint radial accents, and a breathing ambient vignette.
 */

import { motion, AnimatePresence } from 'framer-motion'

const COLORS = [
  '#ff6b35', // warm orange
  '#f43f5e', // rose-red
  '#e11d48', // crimson
  '#d946ef', // fuchsia
  '#a855f7', // purple
  '#7c3aed', // violet
  '#2563eb', // blue
  '#0891b2', // cyan
  '#10b981', // emerald
  '#eab308', // yellow
  '#ff6b35', // loop
]

const GRADIENT_H = `linear-gradient(90deg, ${COLORS.join(', ')})`
const GRADIENT_V = `linear-gradient(180deg, ${COLORS.join(', ')})`

interface AppleBorderGradientProps {
  active?: boolean
  intensity?: 'sm' | 'md' | 'lg' | 'xl'
}

/** Single edge beam with 4 layers: hot core, bright bloom, soft glow, deep haze */
function EdgeBeam({ 
  side, 
  blur, 
  animClass 
}: { 
  side: 'top' | 'bottom' | 'left' | 'right'
  blur: number
  animClass: string
}) {
  const isH = side === 'top' || side === 'bottom'
  const gradient = isH ? GRADIENT_H : GRADIENT_V
  const spread = blur * 2.2

  const containerStyle: React.CSSProperties = isH
    ? { [side]: 0, left: 0, right: 0, height: spread + 40, overflow: 'hidden' }
    : { [side]: 0, top: 0, bottom: 0, width: spread + 40, overflow: 'hidden' }

  // Layer 1: Hot core — very thin, barely blurred, full brightness
  const coreStyle: React.CSSProperties = isH
    ? { [side]: 0, left: 0, width: '400%', height: 3, background: gradient, filter: `blur(${blur * 0.15}px) brightness(1.5)`, opacity: 1 }
    : { [side]: 0, top: 0, height: '400%', width: 3, background: gradient, filter: `blur(${blur * 0.15}px) brightness(1.5)`, opacity: 1 }

  // Layer 2: Bright bloom — saturated, punchy
  const bloomStyle: React.CSSProperties = isH
    ? { [side]: -3, left: 0, width: '400%', height: 14, background: gradient, filter: `blur(${blur * 0.5}px) saturate(2.2) brightness(1.3)`, opacity: 0.9 }
    : { [side]: -3, top: 0, height: '400%', width: 14, background: gradient, filter: `blur(${blur * 0.5}px) saturate(2.2) brightness(1.3)`, opacity: 0.9 }

  // Layer 3: Soft glow — medium spread
  const glowStyle: React.CSSProperties = isH
    ? { [side]: -8, left: 0, width: '400%', height: 32, background: gradient, filter: `blur(${blur * 1.0}px) saturate(1.6)`, opacity: 0.6 }
    : { [side]: -8, top: 0, height: '400%', width: 32, background: gradient, filter: `blur(${blur * 1.0}px) saturate(1.6)`, opacity: 0.6 }

  // Layer 4: Deep haze — very wide, atmospheric
  const hazeStyle: React.CSSProperties = isH
    ? { [side]: -16, left: 0, width: '400%', height: 56, background: gradient, filter: `blur(${blur * 1.8}px) saturate(1.2)`, opacity: 0.3 }
    : { [side]: -16, top: 0, height: '400%', width: 56, background: gradient, filter: `blur(${blur * 1.8}px) saturate(1.2)`, opacity: 0.3 }

  return (
    <div className="absolute" style={containerStyle}>
      <div className={`absolute ${animClass}`} style={hazeStyle} />
      <div className={`absolute ${animClass}`} style={glowStyle} />
      <div className={`absolute ${animClass}`} style={bloomStyle} />
      <div className={`absolute ${animClass}`} style={coreStyle} />
    </div>
  )
}

export default function AppleBorderGradient({ 
  active = false, 
  intensity = 'lg' 
}: AppleBorderGradientProps) {
  const blur = { sm: 30, md: 55, lg: 80, xl: 110 }[intensity]

  const cornerSize = blur * 3
  const cornerBlur = blur * 1.8

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 pointer-events-none z-[45]"
          aria-hidden="true"
        >
          {/* Edge beams — each edge has 4 stacked glow layers */}
          <EdgeBeam side="top" blur={blur} animClass="animate-border-travel-h" />
          <EdgeBeam side="bottom" blur={blur} animClass="animate-border-travel-h-reverse" />
          <EdgeBeam side="left" blur={blur} animClass="animate-border-travel-v-reverse" />
          <EdgeBeam side="right" blur={blur} animClass="animate-border-travel-v" />

          {/* Corner radial accents — large, vivid, pulsing */}
          {[
            { pos: 'top-0 left-0', translate: '-35% -35%', color: COLORS[0], delay: 0 },
            { pos: 'top-0 right-0', translate: '35% -35%', color: COLORS[3], delay: 0.4 },
            { pos: 'bottom-0 right-0', translate: '35% 35%', color: COLORS[6], delay: 0.8 },
            { pos: 'bottom-0 left-0', translate: '-35% 35%', color: COLORS[8], delay: 1.2 },
          ].map((corner, i) => (
            <motion.div
              key={i}
              className={`absolute ${corner.pos} rounded-full`}
              style={{
                width: cornerSize,
                height: cornerSize,
                background: `radial-gradient(circle, ${corner.color}ee 0%, ${corner.color}88 30%, ${corner.color}33 60%, transparent 80%)`,
                filter: `blur(${cornerBlur}px) saturate(2)`,
                transform: `translate(${corner.translate})`,
              }}
              animate={{ 
                opacity: [0.6, 1, 0.6],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3.5,
                delay: corner.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}

          {/* Midpoints — extra glow orbs at edge centers */}
          {[
            { pos: 'top-0 left-1/2', translate: '-50% -45%', color: COLORS[2] },
            { pos: 'bottom-0 left-1/2', translate: '-50% 45%', color: COLORS[7] },
            { pos: 'top-1/2 left-0', translate: '-45% -50%', color: COLORS[9] },
            { pos: 'top-1/2 right-0', translate: '45% -50%', color: COLORS[4] },
          ].map((mid, i) => (
            <motion.div
              key={`mid-${i}`}
              className={`absolute ${mid.pos} rounded-full`}
              style={{
                width: cornerSize * 0.8,
                height: cornerSize * 0.8,
                background: `radial-gradient(circle, ${mid.color}cc 0%, ${mid.color}44 50%, transparent 80%)`,
                filter: `blur(${cornerBlur * 0.9}px) saturate(1.8)`,
                transform: `translate(${mid.translate})`,
              }}
              animate={{ 
                opacity: [0.35, 0.7, 0.35],
                scale: [0.95, 1.1, 0.95],
              }}
              transition={{
                duration: 4,
                delay: i * 0.6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}

          {/* Ambient inner vignette — color wash breathing on edges */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse at top, ${COLORS[3]}1a 0%, transparent 45%),
                radial-gradient(ellipse at bottom, ${COLORS[8]}15 0%, transparent 45%),
                radial-gradient(ellipse at left, ${COLORS[6]}10 0%, transparent 35%),
                radial-gradient(ellipse at right, ${COLORS[0]}10 0%, transparent 35%)
              `,
            }}
            animate={{ opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
