'use client'

/**
 * ResultCard Component
 * Aesthetic: Clean Anchor Block
 */

import { SearchResult } from '../lib/google-search'
import { motion } from 'framer-motion'

export default function ResultCard({ result }: { result: SearchResult }) {
  return (
    <motion.a 
      href={result.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block group relative p-5 rounded-2xl bg-white dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 transition-all hover:shadow-lg hover:-translate-y-0.5"
    >
       <div className="flex flex-col gap-2">
          {/* Header Source Info */}
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
             <div className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-[9px] text-zinc-400">
                {(result.source || 'W').charAt(0).toUpperCase()}
             </div>
             <span className="font-medium truncate max-w-[200px]">{result.displayLink || result.source}</span>
             {result.date && <span className="opacity-50">• {result.date}</span>}
          </div>

          {/* Title - The main interactive bit */}
          <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 group-hover:underline decoration-blue-500/30 underline-offset-2 leading-snug">
             {result.title}
          </h3>

          {/* Snippet */}
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 line-clamp-2">
             {result.snippet}
          </p>
       </div>
    </motion.a>
  )
}
