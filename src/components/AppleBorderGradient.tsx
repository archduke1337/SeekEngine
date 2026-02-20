'use client'

/**
 * AppleBorderGradient — iOS Apple Intelligence viewport border glow
 * Reference: skiper-ui.com/v1/skiper86
 * 
 * Triple-layered edge beams (core + bloom + wide glow) on all 4 edges,
 * corner radial accents, and a pulsing ambient overlay.
 */

import { motion, AnimatePresence } from 'framer-motion'

const COLORS = [
  '#ff6b35', // warm orange
  '#e11d48', // rose
  '#d946ef', // fuchsia
  '#7c3aed', // violet
  '#2563eb', // blue
  '#0891b2', // cyan
  '#059669', // emerald
  '#eab308', // yellow
  '#ff6b35', // loop
]

const GRADIENT_H = `linear-gradient(90deg, ${COLORS.join(', ')})`
const GRADIENT_V = `linear-gradient(180deg, ${COLORS.join(', ')})`

interface AppleBorderGradientProps {
  active?: boolean
  intensity?: 'sm' | 'md' | 'lg' | 'xl'
}

/** Single edge beam with 3 layers: core line, bloom, and wide glow */
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
  const spread = blur * 1.8

  // Position container at edge
  const containerStyle: React.CSSProperties = isH
    ? { [side]: 0, left: 0, right: 0, height: spread + 30, overflow: 'hidden' }
    : { [side]: 0, top: 0, bottom: 0, width: spread + 30, overflow: 'hidden' }

  // Core beam (thin, bright)
  const coreStyle: React.CSSProperties = isH
    ? { [side]: 0, left: 0, width: '400%', height: 4, background: gradient, filter: `blur(${blur * 0.3}px)`, opacity: 1 }
    : { [side]: 0, top: 0, height: '400%', width: 4, background: gradient, filter: `blur(${blur * 0.3}px)`, opacity: 1 }

  // Bloom layer (medium blur, saturated)
  const bloomStyle: React.CSSProperties = isH
    ? { [side]: -4, left: 0, width: '400%', height: 12, background: gradient, filter: `blur(${blur * 0.7}px) saturate(1.8)`, opacity: 0.85 }
    : { [side]: -4, top: 0, height: '400%', width: 12, background: gradient, filter: `blur(${blur * 0.7}px) saturate(1.8)`, opacity: 0.85 }

  // Wide glow layer (heavy blur, softer)
  const glowStyle: React.CSSProperties = isH
    ? { [side]: -10, left: 0, width: '400%', height: 28, background: gradient, filter: `blur(${blur * 1.4}px) saturate(1.4)`, opacity: 0.5 }
    : { [side]: -10, top: 0, height: '400%', width: 28, background: gradient, filter: `blur(${blur * 1.4}px) saturate(1.4)`, opacity: 0.5 }

  return (
    <div className="absolute" style={containerStyle}>
      {/* Wide glow (back) */}
      <div className={`absolute ${animClass}`} style={glowStyle} />
      {/* Bloom (mid) */}
      <div className={`absolute ${animClass}`} style={bloomStyle} />
      {/* Core line (front) */}
      <div className={`absolute ${animClass}`} style={coreStyle} />
    </div>
  )
}

export default function AppleBorderGradient({ 
  active = false, 
  intensity = 'lg' 
}: AppleBorderGradientProps) {
  const blur = { sm: 25, md: 45, lg: 70, xl: 95 }[intensity]

  const cornerSize = blur * 2.5
  const cornerBlur = blur * 1.6

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
          {/* Edge beams — each edge has 3 stacked glow layers */}
          <EdgeBeam side="top" blur={blur} animClass="animate-border-travel-h" />
          <EdgeBeam side="bottom" blur={blur} animClass="animate-border-travel-h-reverse" />
          <EdgeBeam side="left" blur={blur} animClass="animate-border-travel-v-reverse" />
          <EdgeBeam side="right" blur={blur} animClass="animate-border-travel-v" />

          {/* Corner radial accents — large, vivid, pulsing */}
          {[
            { pos: 'top-0 left-0', translate: '-40% -40%', color: COLORS[0], delay: 0 },
            { pos: 'top-0 right-0', translate: '40% -40%', color: COLORS[2], delay: 0.5 },
            { pos: 'bottom-0 right-0', translate: '40% 40%', color: COLORS[4], delay: 1 },
            { pos: 'bottom-0 left-0', translate: '-40% 40%', color: COLORS[6], delay: 1.5 },
          ].map((corner, i) => (
            <motion.div
              key={i}
              className={`absolute ${corner.pos} rounded-full`}
              style={{
                width: cornerSize,
                height: cornerSize,
                background: `radial-gradient(circle, ${corner.color} 0%, ${corner.color}88 40%, transparent 70%)`,
                filter: `blur(${cornerBlur}px) saturate(1.6)`,
                transform: `translate(${corner.translate})`,
              }}
              animate={{ 
                opacity: [0.5, 0.8, 0.5],
                scale: [1, 1.15, 1],
              }}
              transition={{
                duration: 3,
                delay: corner.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}

          {/* Midpoints — extra glow orbs at edge centers */}
          {[
            { pos: 'top-0 left-1/2', translate: '-50% -50%', color: COLORS[1] },
            { pos: 'bottom-0 left-1/2', translate: '-50% 50%', color: COLORS[5] },
            { pos: 'top-1/2 left-0', translate: '-50% -50%', color: COLORS[7] },
            { pos: 'top-1/2 right-0', translate: '50% -50%', color: COLORS[3] },
          ].map((mid, i) => (
            <motion.div
              key={`mid-${i}`}
              className={`absolute ${mid.pos} rounded-full`}
              style={{
                width: cornerSize * 0.7,
                height: cornerSize * 0.7,
                background: `radial-gradient(circle, ${mid.color}aa 0%, transparent 70%)`,
                filter: `blur(${cornerBlur * 0.8}px)`,
                transform: `translate(${mid.translate})`,
              }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{
                duration: 4,
                delay: i * 0.7,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}

          {/* Ambient inner vignette — subtle color wash on edges */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse at top, ${COLORS[2]}12 0%, transparent 50%),
                radial-gradient(ellipse at bottom, ${COLORS[6]}10 0%, transparent 50%),
                radial-gradient(ellipse at left, ${COLORS[4]}0a 0%, transparent 40%),
                radial-gradient(ellipse at right, ${COLORS[0]}0a 0%, transparent 40%)
              `,
            }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
