'use client'

/**
 * AppleBorderGradient — iOS Apple Intelligence viewport border glow
 * Reference: skiper-ui.com/v1/skiper86
 *
 * 5-layer edge beams (white-hot core + neon bloom + vivid glow + deep haze + ultra fog),
 * dark-contrast vignette, huge pulsing corner/midpoint accents, shimmer particles.
 */

import { motion, AnimatePresence } from 'framer-motion'

/* ── Deep, rich, high-saturation palette ── */
const COLORS = [
  '#ff4500', // deep orange-red
  '#dc143c', // crimson
  '#ff006e', // hot magenta
  '#be00ff', // electric purple
  '#7b2fff', // deep violet
  '#4361ee', // royal blue
  '#00b4d8', // electric cyan
  '#00f5d4', // neon mint
  '#39ff14', // neon green
  '#ffd60a', // vivid gold
  '#ff4500', // loop
]

const GRADIENT_H = `linear-gradient(90deg, ${COLORS.join(', ')})`
const GRADIENT_V = `linear-gradient(180deg, ${COLORS.join(', ')})`

interface AppleBorderGradientProps {
  active?: boolean
  intensity?: 'sm' | 'md' | 'lg' | 'xl'
}

/** 5-layer edge beam: white-hot core → neon bloom → vivid glow → deep haze → ultra fog */
function EdgeBeam({
  side,
  blur,
  animClass,
}: {
  side: 'top' | 'bottom' | 'left' | 'right'
  blur: number
  animClass: string
}) {
  const isH = side === 'top' || side === 'bottom'
  const gradient = isH ? GRADIENT_H : GRADIENT_V
  const spread = blur * 2.8

  const containerStyle: React.CSSProperties = isH
    ? { [side]: 0, left: 0, right: 0, height: spread + 60, overflow: 'hidden' }
    : { [side]: 0, top: 0, bottom: 0, width: spread + 60, overflow: 'hidden' }

  // L1 — White-hot core: razor thin, maximum brightness
  const coreStyle: React.CSSProperties = isH
    ? { [side]: 0, left: 0, width: '400%', height: 2, background: gradient, filter: `blur(${blur * 0.1}px) brightness(2.5) saturate(3)`, opacity: 1 }
    : { [side]: 0, top: 0, height: '400%', width: 2, background: gradient, filter: `blur(${blur * 0.1}px) brightness(2.5) saturate(3)`, opacity: 1 }

  // L2 — Neon bloom: punchy, electric, close to core
  const bloomStyle: React.CSSProperties = isH
    ? { [side]: -2, left: 0, width: '400%', height: 10, background: gradient, filter: `blur(${blur * 0.35}px) brightness(2) saturate(3)`, opacity: 0.95 }
    : { [side]: -2, top: 0, height: '400%', width: 10, background: gradient, filter: `blur(${blur * 0.35}px) brightness(2) saturate(3)`, opacity: 0.95 }

  // L3 — Vivid glow: rich colored aura
  const glowStyle: React.CSSProperties = isH
    ? { [side]: -6, left: 0, width: '400%', height: 28, background: gradient, filter: `blur(${blur * 0.8}px) brightness(1.6) saturate(2.5)`, opacity: 0.75 }
    : { [side]: -6, top: 0, height: '400%', width: 28, background: gradient, filter: `blur(${blur * 0.8}px) brightness(1.6) saturate(2.5)`, opacity: 0.75 }

  // L4 — Deep haze: wide atmospheric spread
  const hazeStyle: React.CSSProperties = isH
    ? { [side]: -14, left: 0, width: '400%', height: 52, background: gradient, filter: `blur(${blur * 1.5}px) brightness(1.3) saturate(1.8)`, opacity: 0.45 }
    : { [side]: -14, top: 0, height: '400%', width: 52, background: gradient, filter: `blur(${blur * 1.5}px) brightness(1.3) saturate(1.8)`, opacity: 0.45 }

  // L5 — Ultra fog: massive diffuse glow for atmosphere
  const fogStyle: React.CSSProperties = isH
    ? { [side]: -24, left: 0, width: '400%', height: 80, background: gradient, filter: `blur(${blur * 2.5}px) saturate(1.4)`, opacity: 0.2 }
    : { [side]: -24, top: 0, height: '400%', width: 80, background: gradient, filter: `blur(${blur * 2.5}px) saturate(1.4)`, opacity: 0.2 }

  return (
    <div className="absolute" style={containerStyle}>
      <div className={`absolute ${animClass}`} style={fogStyle} />
      <div className={`absolute ${animClass}`} style={hazeStyle} />
      <div className={`absolute ${animClass}`} style={glowStyle} />
      <div className={`absolute ${animClass}`} style={bloomStyle} />
      <div className={`absolute ${animClass}`} style={coreStyle} />
    </div>
  )
}

export default function AppleBorderGradient({
  active = false,
  intensity = 'lg',
}: AppleBorderGradientProps) {
  const blur = { sm: 35, md: 65, lg: 95, xl: 130 }[intensity]

  const cornerSize = blur * 3.5
  const cornerBlur = blur * 2.2

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 pointer-events-none z-[45]"
          aria-hidden="true"
        >
          {/* Dark contrast overlay — makes the glow pop against a darker frame */}
          <div
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 8%),
                linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 8%),
                linear-gradient(to right, rgba(0,0,0,0.35) 0%, transparent 6%),
                linear-gradient(to left, rgba(0,0,0,0.35) 0%, transparent 6%)
              `,
            }}
          />

          {/* Edge beams — each edge has 5 stacked glow layers */}
          <EdgeBeam side="top" blur={blur} animClass="animate-border-travel-h" />
          <EdgeBeam side="bottom" blur={blur} animClass="animate-border-travel-h-reverse" />
          <EdgeBeam side="left" blur={blur} animClass="animate-border-travel-v-reverse" />
          <EdgeBeam side="right" blur={blur} animClass="animate-border-travel-v" />

          {/* Corner radial accents — massive, vivid, pulsing with high contrast */}
          {[
            { pos: 'top-0 left-0', translate: '-30% -30%', colors: [COLORS[0], COLORS[2]], delay: 0 },
            { pos: 'top-0 right-0', translate: '30% -30%', colors: [COLORS[3], COLORS[4]], delay: 0.3 },
            { pos: 'bottom-0 right-0', translate: '30% 30%', colors: [COLORS[6], COLORS[7]], delay: 0.6 },
            { pos: 'bottom-0 left-0', translate: '-30% 30%', colors: [COLORS[8], COLORS[9]], delay: 0.9 },
          ].map((corner, i) => (
            <motion.div
              key={i}
              className={`absolute ${corner.pos} rounded-full`}
              style={{
                width: cornerSize,
                height: cornerSize,
                background: `radial-gradient(circle, ${corner.colors[0]} 0%, ${corner.colors[1]}bb 25%, ${corner.colors[0]}55 50%, transparent 75%)`,
                filter: `blur(${cornerBlur}px) saturate(2.5) brightness(1.8)`,
                transform: `translate(${corner.translate})`,
              }}
              animate={{
                opacity: [0.7, 1, 0.7],
                scale: [1, 1.25, 1],
              }}
              transition={{
                duration: 3,
                delay: corner.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}

          {/* Midpoint orbs — intense glow at edge centers */}
          {[
            { pos: 'top-0 left-1/2', translate: '-50% -40%', color: COLORS[2], secondary: COLORS[3] },
            { pos: 'bottom-0 left-1/2', translate: '-50% 40%', color: COLORS[7], secondary: COLORS[6] },
            { pos: 'top-1/2 left-0', translate: '-40% -50%', color: COLORS[9], secondary: COLORS[0] },
            { pos: 'top-1/2 right-0', translate: '40% -50%', color: COLORS[4], secondary: COLORS[5] },
          ].map((mid, i) => (
            <motion.div
              key={`mid-${i}`}
              className={`absolute ${mid.pos} rounded-full`}
              style={{
                width: cornerSize * 0.85,
                height: cornerSize * 0.85,
                background: `radial-gradient(circle, ${mid.color} 0%, ${mid.secondary}88 40%, transparent 75%)`,
                filter: `blur(${cornerBlur * 0.85}px) saturate(2.2) brightness(1.5)`,
                transform: `translate(${mid.translate})`,
              }}
              animate={{
                opacity: [0.4, 0.85, 0.4],
                scale: [0.9, 1.15, 0.9],
              }}
              transition={{
                duration: 3.5,
                delay: i * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}

          {/* Shimmer particles — small bright dots that float near edges */}
          {Array.from({ length: 8 }).map((_, i) => {
            const edge = i % 4
            const t = (i / 8) * 100
            const style: React.CSSProperties =
              edge === 0
                ? { top: 0, left: `${t}%`, transform: 'translate(-50%, -50%)' }
                : edge === 1
                ? { bottom: 0, left: `${t + 12}%`, transform: 'translate(-50%, 50%)' }
                : edge === 2
                ? { left: 0, top: `${t + 25}%`, transform: 'translate(-50%, -50%)' }
                : { right: 0, top: `${t + 37}%`, transform: 'translate(50%, -50%)' }
            return (
              <motion.div
                key={`shimmer-${i}`}
                className="absolute rounded-full"
                style={{
                  ...style,
                  width: 6,
                  height: 6,
                  background: COLORS[i % COLORS.length],
                  filter: `blur(3px) brightness(2.5)`,
                  boxShadow: `0 0 12px 4px ${COLORS[i % COLORS.length]}88`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.5, 0.5],
                }}
                transition={{
                  duration: 2.5 + i * 0.3,
                  delay: i * 0.4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )
          })}

          {/* Ambient vignette — colored glow wash breathing on edges */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse at top, ${COLORS[2]}30 0%, transparent 40%),
                radial-gradient(ellipse at bottom, ${COLORS[7]}28 0%, transparent 40%),
                radial-gradient(ellipse at left, ${COLORS[4]}20 0%, transparent 30%),
                radial-gradient(ellipse at right, ${COLORS[9]}20 0%, transparent 30%)
              `,
            }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
