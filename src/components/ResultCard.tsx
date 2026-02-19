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
      className="block p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500/30 dark:hover:border-blue-400/30 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-all duration-200"
    >
       <div className="space-y-2">
          {/* Header */}
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
             <div className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-[9px] text-zinc-500">
                {(result.source || result.displayLink || 'W').charAt(0).toUpperCase()}
             </div>
             <span className="font-medium truncate max-w-[200px]">{result.source || result.displayLink || new URL(result.link).hostname}</span>
          </div>

          {/* Title - The main interactive bit */}
          <h3 className="text-[17px] font-semibold text-blue-600 dark:text-blue-400 leading-snug">
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
