'use client'

/**
 * ResultCard Component
 * Aesthetic: SwiftUI Glass Tile with micro-interactions
 */

import { SearchResult } from '../lib/google-search'
import { motion } from 'framer-motion'

export default function ResultCard({ result }: { result: SearchResult }) {
  return (
    <motion.a
      href={result.link}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="block p-6 rounded-[2rem] bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-black/5 dark:border-white/5 shadow-sm hover:shadow-xl transition-all group"
    >
      <div className="flex items-start justify-between gap-5">
        <div className="flex-1 min-w-0">
          {/* Source Link */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate">
              {result.source || result.displayLink}
            </span>
            <div className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-800" />
            <span className="text-[9px] font-bold text-slate-400">Node Verified</span>
          </div>
          
          {/* Title - Bold & Responsive */}
          <h3 className="text-xl font-bold text-black dark:text-white group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors line-clamp-1 mb-2 tracking-tight">
            {result.title}
          </h3>
          
          {/* Snippet - Refined Typography */}
          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium">
            {result.snippet}
          </p>
        </div>
      </div>
    </motion.a>
  )
}
