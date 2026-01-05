'use client'

/**
 * ResultCard Component
 * Aesthetic: SwiftUI Glass Tile with micro-interactions
 */

import { SearchResult } from '../lib/google-search'
import { motion } from 'framer-motion'

export default function ResultCard({ result }: { result: SearchResult }) {
  return (
    <>
      <span id="external-link-hint" className="sr-only">
        Opens in a new tab
      </span>
      <motion.a
        href={result.link}
        target="_blank"
        rel="noopener noreferrer"
        role="article"
        aria-label={`Search result: ${result.title}`}
        aria-describedby="external-link-hint"
        className="block group"
      >
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:border-black/10 dark:hover:border-white/10 transition-all duration-300 shadow-sm hover:shadow-md">
           
           {/* Metadata Header */}
           <div className="flex items-center gap-2 mb-3">
             <div className="w-4 h-4 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[8px] font-bold text-zinc-400">
               {result.source?.slice(0,1) || 'W'}
             </div>
             <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 truncate">
                {result.displayLink || result.source}
             </span>
             <span className="text-xs text-zinc-300 dark:text-zinc-600">•</span>
             <span className="text-xs text-zinc-400">Verified</span>
           </div>

           {/* Title */}
           <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 group-hover:underline decoration-blue-500/30 underline-offset-2 mb-2 leading-snug tracking-tight">
              {result.title}
           </h3>

           {/* Snippet */}
           <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2">
              {result.snippet}
           </p>

        </div>
      </motion.a>
    </>
  )
}
