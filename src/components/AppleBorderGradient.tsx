'use client'

/**
 * AppleBorderGradient — iOS Apple Intelligence inspired viewport border glow
 * Reference: skiper-ui.com/v1/skiper86
 * 
 * Uses 4 edge beams with traveling gradient colors + heavy blur.
 * Each beam is a long gradient strip positioned at a viewport edge,
 * rotating hue via CSS animation to create the perimeter color travel effect.
 */

import { motion, AnimatePresence } from 'framer-motion'

const COLORS = [
  '#f59e0b', // amber
  '#e11d48', // rose
  '#7c3aed', // violet
  '#0284c7', // sky
  '#059669', // emerald
  '#f59e0b', // amber (loop)
]

const GRADIENT = `linear-gradient(90deg, ${COLORS.join(', ')})`
const GRADIENT_V = `linear-gradient(180deg, ${COLORS.join(', ')})`

interface AppleBorderGradientProps {
  active?: boolean
  /** Blur intensity: sm=20, md=40, lg=60, xl=80 */
  intensity?: 'sm' | 'md' | 'lg' | 'xl'
}

export default function AppleBorderGradient({ 
  active = false, 
  intensity = 'lg' 
}: AppleBorderGradientProps) {
  const blur = { sm: 20, md: 40, lg: 60, xl: 80 }[intensity]

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="fixed inset-0 pointer-events-none z-[45]"
          aria-hidden="true"
        >
          {/* Top edge */}
          <div
            className="absolute top-0 left-0 right-0 overflow-hidden"
            style={{ height: blur + 20 }}
          >
            <div
              className="absolute top-0 left-0 h-[6px] animate-border-travel-h"
              style={{
                width: '300%',
                background: GRADIENT,
                filter: `blur(${blur}px)`,
                opacity: 0.8,
              }}
            />
          </div>

          {/* Bottom edge */}
          <div
            className="absolute bottom-0 left-0 right-0 overflow-hidden"
            style={{ height: blur + 20 }}
          >
            <div
              className="absolute bottom-0 right-0 h-[6px] animate-border-travel-h-reverse"
              style={{
                width: '300%',
                background: GRADIENT,
                filter: `blur(${blur}px)`,
                opacity: 0.8,
              }}
            />
          </div>

          {/* Left edge */}
          <div
            className="absolute top-0 bottom-0 left-0 overflow-hidden"
            style={{ width: blur + 20 }}
          >
            <div
              className="absolute top-0 left-0 w-[6px] animate-border-travel-v-reverse"
              style={{
                height: '300%',
                background: GRADIENT_V,
                filter: `blur(${blur}px)`,
                opacity: 0.8,
              }}
            />
          </div>

          {/* Right edge */}
          <div
            className="absolute top-0 bottom-0 right-0 overflow-hidden"
            style={{ width: blur + 20 }}
          >
            <div
              className="absolute top-0 right-0 w-[6px] animate-border-travel-v"
              style={{
                height: '300%',
                background: GRADIENT_V,
                filter: `blur(${blur}px)`,
                opacity: 0.8,
              }}
            />
          </div>

          {/* Corner glow accents for seamless joins */}
          <div className="absolute top-0 left-0 w-32 h-32 rounded-full opacity-50"
            style={{ background: COLORS[0], filter: `blur(${blur * 1.2}px)`, transform: 'translate(-30%, -30%)' }}
          />
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-50"
            style={{ background: COLORS[1], filter: `blur(${blur * 1.2}px)`, transform: 'translate(30%, -30%)' }}
          />
          <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full opacity-50"
            style={{ background: COLORS[2], filter: `blur(${blur * 1.2}px)`, transform: 'translate(30%, 30%)' }}
          />
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-50"
            style={{ background: COLORS[3], filter: `blur(${blur * 1.2}px)`, transform: 'translate(-30%, 30%)' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
