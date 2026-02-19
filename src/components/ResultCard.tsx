'use client'

/**
 * ResultCard Component
 * Aesthetic: Clean Anchor Block with Elevated Hover States
 */

import { SearchResult } from '../lib/google-search'
import { motion } from 'framer-motion'
import { useState } from 'react'

function Favicon({ url, fallback }: { url: string; fallback: string }) {
  const [error, setError] = useState(false)
  
  if (error) {
    return (
      <div className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-[9px] text-zinc-500 dark:text-zinc-400 shrink-0">
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
      className="w-5 h-5 rounded-full shrink-0"
      onError={() => setError(true)}
      loading="lazy"
    />
  )
}

export default function ResultCard({ result }: { result: SearchResult }) {
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
      className="block p-5 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 transition-all duration-300 group"
      style={{
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 24px -8px rgba(0,0,0,0.1)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'
      }}
    >
       <div className="space-y-2.5">
          {/* Header - Source */}
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
             <Favicon 
               url={hostname} 
               fallback={(result.source || result.displayLink || 'W').charAt(0).toUpperCase()}
             />
             <span className="font-medium truncate max-w-[200px]">{result.source || result.displayLink || hostname}</span>
             <svg className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-50 transition-opacity shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <path d="M7 17L17 7M17 7H7M17 7V17" />
             </svg>
          </div>

          {/* Title */}
          <h3 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
             {result.title}
          </h3>

          {/* Snippet */}
          <p className="text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400 line-clamp-2">
             {result.snippet}
          </p>
       </div>
    </motion.a>
  )
}
