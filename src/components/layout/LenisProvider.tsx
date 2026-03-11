'use client'

/**
 * Modern Lenis Smooth Scroll Provider
 * Uses the latest React-integrated Lenis for maximum performance
 * Optimized for high-refresh rate displays (120Hz+)
 */

import { ReactLenis } from 'lenis/react'
import { ReactNode } from 'react'

export default function LenisProvider({ children }: { children: ReactNode }) {
  const options = {
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
    infinite: false,
    lerp: 0.1, // Smooth linear interpolation
  }

  return (
    <ReactLenis root options={options}>
      {children}
    </ReactLenis>
  )
}
