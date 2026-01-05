'use client'

/**
 * Search Bar Component
 * Aesthetic: SwiftUI Glass Architecture with AI Prediction Focus
 */

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearch } from '../hooks/useSearch'

export default function SearchBar({ 
  autoFocus = false, 
  onTyping,
  onFocusChange
}: { 
  autoFocus?: boolean, 
  onTyping?: (isTyping: boolean) => void,
  onFocusChange?: (isFocused: boolean) => void
}) {
  const { 
    query, 
    suggestions, 
    prediction, 
    isLoading, 
    updateQuery, 
    handleSearch,
    setSuggestions,
    setPrediction
  } = useSearch()
  
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const [isFocused, setIsFocused] = useState(false)

  // Sync state back to parent for 3D/System effects
  useEffect(() => {
    onTyping?.(query.length > 0)
  }, [query, onTyping])

  useEffect(() => {
    onFocusChange?.(isFocused)
  }, [isFocused, onFocusChange])

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSearch(suggestions[selectedIndex])
      } else {
        handleSearch(query)
      }
      setShowSuggestions(false)
    } else if (e.key === 'Tab' && prediction && prediction !== query) {
      e.preventDefault()
      updateQuery(prediction)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  const ghostText = prediction && prediction.toLowerCase().startsWith(query.toLowerCase())
    ? prediction.slice(query.length)
    : ''

  // Slash command detection for UI feedback
  const isCommand = query.startsWith('/')

  return (
    <div className="relative w-full" ref={suggestionsRef}>
      <motion.div 
        layout
        className={`relative group backdrop-blur-xl rounded-[2rem] sm:rounded-[2.5rem] border shadow-2xl overflow-hidden transition-all duration-700 ${
          isFocused 
            ? 'ring-4 ring-red-500/5 bg-white/60 dark:bg-zinc-900/60 border-red-500/20 shadow-red-500/10' 
            : isCommand 
              ? 'bg-zinc-950/90 border-red-500/30' 
              : 'bg-white/40 dark:bg-zinc-900/40 border-black/5 dark:border-white/5 shadow-zinc-200/50 dark:shadow-none'
        }`}
      >
        {/* Thermal Pulse (Bottom Line) */}
        <AnimatePresence>
          {isFocused && (
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: '100%' }}
               exit={{ width: 0 }}
               className="absolute bottom-0 left-0 h-[2px] bg-red-500 z-20 shadow-[0_-2px_8px_red]"
            />
          )}
        </AnimatePresence>

        {/* Leading Icon - AI Pulse */}
        <div className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-10 transition-transform duration-500 group-focus-within:scale-110">
          <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
            isLoading ? 'bg-red-500 animate-pulse' : isCommand ? 'bg-red-500 shadow-[0_0_8px_red]' : (isFocused ? 'bg-red-400' : 'bg-slate-300 dark:bg-slate-700')
          } transition-colors duration-500`} />
        </div>

        {/* Search Input Layer */}
        <div className="relative">
          {ghostText && !isCommand && (
            <div className="absolute inset-0 flex items-center pl-10 sm:pl-14 pr-16 sm:pr-20 py-4 sm:py-5 pointer-events-none overflow-hidden">
              <span className="text-sm sm:text-lg text-transparent leading-none whitespace-pre tracking-tight">{query}</span>
              <span className="text-sm sm:text-lg text-slate-300 dark:text-slate-600 leading-none whitespace-pre tracking-tight">{ghostText}</span>
            </div>
          )}
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              updateQuery(e.target.value)
              setSelectedIndex(-1)
              setShowSuggestions(true)
            }}
            onFocus={() => {
                suggestions.length > 0 && setShowSuggestions(true)
                setIsFocused(true)
            }}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={isCommand ? "Console Mode: Enter command..." : "Search intelligence index..."}
            autoFocus={autoFocus}
            className={`w-full pl-10 sm:pl-14 pr-16 sm:pr-20 py-4 sm:py-5 text-sm sm:text-lg bg-transparent border-none focus:outline-none transition-all duration-300 tracking-tight font-medium ${
              isCommand ? 'text-red-500 font-mono' : 'text-black dark:text-white'
            }`}
            aria-label="Search"
          />
        </div>

        {/* Action Layer */}
        <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 sm:gap-3 z-10">
           <AnimatePresence>
             {ghostText && !isCommand && (
               <motion.span 
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.9 }}
                 className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-slate-400 bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-full"
               >
                 Tab
               </motion.span>
             )}
           </AnimatePresence>

           <button
             onClick={() => handleSearch(query)}
             className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl sm:rounded-2xl transition-all duration-500 ${
               query.trim() 
               ? (isCommand ? 'bg-red-500 text-white' : 'bg-black dark:bg-white text-white dark:text-black') + ' scale-100 opacity-100 shadow-lg' 
               : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 scale-90 opacity-0 pointer-events-none'
             }`}
           >
             <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
             </svg>
           </button>
        </div>
      </motion.div>

      {/* Suggestions Architecture */}
      <AnimatePresence>
        {showSuggestions && !isCommand && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="absolute top-full left-0 right-0 mt-3 md:mt-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-3xl border border-black/5 dark:border-white/5 rounded-[2.2rem] md:rounded-[2.8rem] shadow-2xl z-50 p-2 md:p-3 pb-6 md:pb-8"
          >
            <div className="px-5 md:px-7 py-3 md:py-4 flex items-center gap-3 border-b border-black/5 dark:border-white/5 mb-2 md:mb-3">
              <div className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
                {(suggestions && suggestions.length) || 0} Paths Found
              </div>
            </div>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  updateQuery(suggestion)
                  handleSearch(suggestion)
                  setShowSuggestions(false)
                }}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full px-5 md:px-7 py-3.5 md:py-4.5 text-left text-sm flex items-center gap-4 md:gap-5 rounded-[1.5rem] md:rounded-[1.8rem] transition-all duration-300 ${
                  selectedIndex === index
                    ? 'bg-black/5 dark:bg-white/10 backdrop-blur-md text-black dark:text-white shadow-sm scale-[1.01] md:scale-[1.02]'
                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                }`}
              >
                <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${selectedIndex === index ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-slate-300 dark:bg-slate-700'} transition-all duration-500`} />
                <span className="truncate font-bold tracking-tight text-sm md:text-lg">{suggestion}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
