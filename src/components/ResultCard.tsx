'use client'

/**
 * ResultCard Component
 * Aesthetic: Retro-Futuristic Terminal Card with neon accents
 */

import { SearchResult } from '../lib/google-search'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useTheme } from 'next-themes'

function Favicon({ url, fallback }: { url: string; fallback: string }) {
  const [error, setError] = useState(false)
  
  if (error) {
    return (
      <div className="w-5 h-5 rounded flex items-center justify-center font-mono font-bold text-[9px] shrink-0"
           style={{ background: 'rgba(0,255,240,0.08)', color: 'rgba(0,255,240,0.4)' }}>
        {fallback}
      </div>
    )
  }

  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(url)}&sz=32`}
      alt=""
      width={20}
      height={20}
      className="w-5 h-5 rounded shrink-0"
      onError={() => setError(true)}
      loading="lazy"
    />
  )
}

export default function ResultCard({ result }: { result: SearchResult }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const accentColor = isDark ? '#00fff0' : '#0090ff'
  
  const hostname = (() => {
    try { return new URL(result.link).hostname } 
    catch { return result.displayLink || '' }
  })()

  return (
    <motion.a 
      href={result.link}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="block p-4 rounded-xl group relative overflow-hidden transition-all duration-300"
      style={{
        background: isDark ? 'rgba(14, 14, 22, 0.6)' : 'rgba(240, 240, 248, 0.6)',
        border: isDark ? '1px solid rgba(0,255,240,0.06)' : '1px solid rgba(0,144,255,0.08)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = isDark ? 'rgba(0,255,240,0.15)' : 'rgba(0,144,255,0.2)'
        ;(e.currentTarget as HTMLElement).style.boxShadow = isDark ? '0 0 20px -8px rgba(0,255,240,0.1)' : '0 0 20px -8px rgba(0,144,255,0.08)'
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = isDark ? 'rgba(0,255,240,0.06)' : 'rgba(0,144,255,0.08)'
        ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
      }}
    >
      {/* Top neon line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity"
           style={{ background: `linear-gradient(90deg, transparent, ${accentColor}44, transparent)` }} />

       <div className="space-y-2">
          {/* Source */}
          <div className="flex items-center gap-2 font-mono text-[11px]" style={{ color: isDark ? '#6b6b80' : '#6b6b80' }}>
             <Favicon url={hostname} fallback={(result.source || result.displayLink || 'W').charAt(0).toUpperCase()} />
             <span className="truncate max-w-[200px]">{result.source || result.displayLink || hostname}</span>
             <svg className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-60 transition-opacity shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  style={{ color: accentColor }}>
               <path d="M7 17L17 7M17 7H7M17 7V17" />
             </svg>
          </div>

          {/* Title */}
          <h3 className="text-[14px] font-semibold font-display leading-snug transition-colors"
              style={{ color: isDark ? '#c0c0d0' : '#1a1a2a' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = accentColor }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = isDark ? '#c0c0d0' : '#1a1a2a' }}
          >
             {result.title}
          </h3>

          {/* Snippet */}
          <p className="text-[12px] leading-relaxed line-clamp-2 font-mono" style={{ color: isDark ? '#6b6b80' : '#6b6b80' }}>
             {result.snippet}
          </p>
       </div>
    </motion.a>
  )
}
