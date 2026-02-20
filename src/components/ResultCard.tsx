'use client'

/**
 * ResultCard Component — Contrast Shader Card with Scroll Fade
 * Inspired by duna.com card system + Skiper UI Scroll Fade (skiper87)
 * Features: Contrast gradient shaders (dark-to-light / light-to-dark),
 * mouse tracking spotlight, smooth hover transitions
 */

import { SearchResult } from '../lib/google-search'
import { motion } from 'framer-motion'
import { useState, useRef, useCallback } from 'react'

const SHADER_VARIANTS = [
  'shader-card',
  'shader-card-2',
  'shader-card-3',
]

function Favicon({ url, fallback }: { url: string; fallback: string }) {
  const [error, setError] = useState(false)
  
  if (error) {
    return (
      <div className="w-5 h-5 rounded-md flex items-center justify-center font-bold text-[9px] shrink-0 bg-foreground/5 text-foreground/40">
        {fallback}
      </div>
    )
  }

  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${url}&sz=32`}
      alt=""
      width={20}
      height={20}
      className="w-5 h-5 rounded-md shrink-0"
      onError={() => setError(true)}
      loading="lazy"
    />
  )
}

export default function ResultCard({ result, index = 0 }: { result: SearchResult; index?: number }) {
  const cardRef = useRef<HTMLAnchorElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  
  const hostname = (() => {
    try { return new URL(result.link).hostname } 
    catch { return result.displayLink || '' }
  })()

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }, [])

  // Cycle through shader variants for visual variety
  const shaderClass = SHADER_VARIANTS[index % SHADER_VARIANTS.length]

  return (
    <motion.a 
      ref={cardRef}
      href={result.link}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`block p-4 rounded-xl group relative overflow-hidden transition-all duration-400 ${SHADER_VARIANTS[index % 3]}`}
    >
      {/* Mouse-tracking spotlight — subtle */}
      {isHovered && (
        <div
          className="pointer-events-none absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(300px circle at ${mousePos.x}px ${mousePos.y}px, var(--glow-soft), transparent 40%)`,
          }}
        />
      )}

      {/* Top accent line on hover */}
      <div className="absolute top-0 left-4 right-4 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-foreground/8" />

       <div className="relative z-10 space-y-2.5">
          {/* Source */}
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
             <Favicon url={hostname} fallback={(result.source || result.displayLink || 'W').charAt(0).toUpperCase()} />
             <span className="truncate max-w-[200px]">{result.source || result.displayLink || hostname}</span>
             <svg className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-40 transition-opacity shrink-0"
               viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <path d="M7 17L17 7M17 7H7M17 7V17" />
             </svg>
          </div>

          {/* Title */}
          <h3 className="text-[14px] font-semibold leading-snug text-foreground/85 group-hover:text-foreground transition-colors duration-200">
             {result.title}
          </h3>

          {/* Snippet */}
          <p className="text-[12px] leading-relaxed line-clamp-2 text-muted-foreground/70">
             {result.snippet}
          </p>
       </div>
    </motion.a>
  )
}
