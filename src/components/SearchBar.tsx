'use client'

/**
 * Search Bar Component
 * Aesthetic: SwiftUI Glass Architecture with AI Prediction Focus
 */

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useDebounce } from '../hooks/useDebounce'
import { motion, AnimatePresence } from 'framer-motion'

export default function SearchBar({ 
  autoFocus = false, 
  onTyping 
}: { 
  autoFocus?: boolean, 
  onTyping?: (isTyping: boolean) => void 
}) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [prediction, setPrediction] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const debouncedQuery = useDebounce(query, 300)
  const router = useRouter()
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setSuggestions([])
      setPrediction('')
      setShowSuggestions(false)
      return
    }

    setIsLoading(true)
    fetchSuggestions(debouncedQuery)
  }, [debouncedQuery])

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

  async function fetchSuggestions(q: string) {
    try {
      const response = await fetch(`/api/ai/suggest?q=${encodeURIComponent(q)}`)
      const data = await response.json()
      const newSuggestions = data.suggestions || []
      setSuggestions(newSuggestions)
      
      if (newSuggestions.length > 0) {
        const matchingSuggestion = newSuggestions.find((s: string) => 
          s.toLowerCase().startsWith(q.toLowerCase())
        )
        if (matchingSuggestion) {
          setPrediction(matchingSuggestion)
        } else {
          setPrediction('')
        }
      }
      
      setShowSuggestions(true)
      setSelectedIndex(-1)
    } catch (error) {
      console.error('Error fetching suggestions:', error)
      setSuggestions([])
      setPrediction('')
    } finally {
      setIsLoading(false)
    }
  }

  function handleSearch(searchQuery: string) {
    if (searchQuery.trim()) {
      router.push(`/results?q=${encodeURIComponent(searchQuery)}`)
      setShowSuggestions(false)
      setPrediction('')
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSearch(suggestions[selectedIndex])
      } else {
        handleSearch(query)
      }
    } else if (e.key === 'Tab' && prediction && prediction !== query) {
      e.preventDefault()
      setQuery(prediction)
      setPrediction('')
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
      setPrediction('')
    }
  }

  const ghostText = prediction && prediction.toLowerCase().startsWith(query.toLowerCase())
    ? prediction.slice(query.length)
    : ''

  return (
    <div className="relative w-full" ref={suggestionsRef}>
      <motion.div 
        layout
        className="relative group bg-white/40 dark:bg-zinc-900/40 backdrop-blur-3xl rounded-[2rem] sm:rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-black/10 focus-within:shadow-black/10"
      >
        {/* Leading Icon - AI Pulse */}
        <div className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-10">
          <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isLoading ? 'bg-red-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-700'} transition-colors duration-500`} />
        </div>

        {/* Search Input Layer */}
        <div className="relative">
          {ghostText && (
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
              const val = e.target.value
              setQuery(val)
              setSelectedIndex(-1)
              onTyping?.(val.length > 0)
            }}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search intelligence index..."
            autoFocus={autoFocus}
            className="w-full pl-10 sm:pl-14 pr-16 sm:pr-20 py-4 sm:py-5 text-sm sm:text-lg bg-transparent border-none text-black dark:text-white placeholder-slate-400 focus:outline-none transition-all duration-300 tracking-tight font-medium"
            aria-label="Search query"
          />
        </div>

        {/* Action Layer */}
        <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 sm:gap-3 z-10">
           <AnimatePresence>
             {ghostText && (
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
               ? 'bg-black dark:bg-white text-white dark:text-black scale-100 opacity-100 shadow-lg' 
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
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="absolute top-full left-0 right-0 mt-3 md:mt-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-3xl border border-black/5 dark:border-white/5 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden z-50 p-1.5 md:p-2"
          >
            <div className="px-4 md:px-5 py-2 md:py-3 flex items-center gap-3 border-b border-black/5 dark:border-white/5 mb-1 md:mb-2">
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Predicted Intentions</span>
            </div>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  setQuery(suggestion)
                  handleSearch(suggestion)
                }}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full px-4 md:px-5 py-3 md:py-4 text-left text-sm flex items-center gap-3 md:gap-4 rounded-2xl md:rounded-3xl transition-all duration-300 ${
                  selectedIndex === index
                    ? 'bg-black dark:bg-white text-white dark:text-black shadow-xl ring-4 ring-black/5 dark:ring-white/5 scale-[1.01] md:scale-[1.02]'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <div className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full ${selectedIndex === index ? 'bg-red-400' : 'bg-slate-300 dark:bg-slate-600'}`} />
                <span className="truncate font-bold tracking-tight text-sm md:text-base">{suggestion}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
