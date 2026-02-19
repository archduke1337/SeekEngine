'use client'

/**
 * Search Bar Component
 * Aesthetic: Modern glassmorphism with gradient accents
 */

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearch } from '../hooks/useSearch'
import { useSearchHistory } from '../hooks/useSearchHistory'
import { useTheme } from 'next-themes'

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
  const { resolvedTheme } = useTheme()
  const { history, removeEntry } = useSearchHistory()
  const isDark = resolvedTheme === 'dark'
  
  const [isFocused, setIsFocused] = useState(false)
  const isCommand = query.startsWith('/')
  const isTyping = query.length > 0

  useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      if (e.key === '/' && !isFocused && !inputRef.current?.matches(':focus')) {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape' && isFocused) {
        inputRef.current?.blur()
        setShowSuggestions(false)
      }
    }
    document.addEventListener('keydown', handleGlobalKeyDown)
    return () => document.removeEventListener('keydown', handleGlobalKeyDown)
  }, [isFocused])

  useEffect(() => {
    if (!showSuggestions) return
    function handleClickOutside(event: MouseEvent) {
      if (!suggestionsRef.current) return
      const target = event.target as Node
      const isInside = suggestionsRef.current.contains(target)
      const isInput = inputRef.current?.contains(target)
      if (!isInside && !isInput) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showSuggestions])

  useEffect(() => { onTyping?.(isTyping) }, [isTyping, onTyping])
  useEffect(() => { onFocusChange?.(isFocused) }, [isFocused, onFocusChange])
  useEffect(() => { setSelectedIndex(-1) }, [suggestions])

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      if (!query.trim()) return
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSearch(suggestions[selectedIndex])
      } else {
        handleSearch(query)
      }
      setShowSuggestions(false)
    } else if (e.key === 'ArrowDown' && suggestions.length > 0) {
      e.preventDefault()
      setSelectedIndex(prev => prev < suggestions.length - 1 ? prev + 1 : prev)
    } else if (e.key === 'ArrowUp' && suggestions.length > 0) {
      e.preventDefault()
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    } else if (e.key === 'Tab' && prediction && prediction !== query) {
      e.preventDefault()
      updateQuery(prediction)
    }
  }

  const ghostText = isTyping && prediction && prediction.toLowerCase().startsWith(query.toLowerCase())
    ? prediction.slice(query.length)
    : ''
  
  const showSuggestionsList = showSuggestions && !isCommand && suggestions.length > 0
  const showHistory = isFocused && !isTyping && !showSuggestionsList && history.length > 0

  return (
    <div className="relative w-full z-[100]" ref={suggestionsRef}>
      {/* Main search container */}
      <motion.div 
        layout
        className="relative z-50 group rounded-2xl transition-all duration-500 ease-out"
        initial={false}
        animate={isFocused ? { scale: 1.01 } : { scale: 1 }}
      >
        {/* Animated gradient border (visible on focus) */}
        <AnimatePresence>
          {isFocused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute -inset-[1px] rounded-2xl z-0"
              style={{
                background: 'linear-gradient(135deg, var(--gradient-from), var(--gradient-via), var(--gradient-to))',
                backgroundSize: '200% 200%',
                animation: 'gradient-shift 4s ease infinite',
              }}
            />
          )}
        </AnimatePresence>

        <div 
           className={`relative overflow-hidden rounded-2xl flex items-center transition-all duration-500 glass-heavy ${isFocused ? 'shadow-xl' : 'shadow-lg shadow-black/5 dark:shadow-black/20'}`}
           style={{
             background: isFocused
               ? (isDark ? 'rgba(10, 10, 20, 0.95)' : 'rgba(255, 255, 255, 0.95)')
               : undefined,
           }}
        >
            {/* Search icon */}
            <div className="pl-4 pr-2 flex items-center justify-center relative z-10">
              {isLoading ? (
                <div className="w-[18px] h-[18px] rounded-full border-[2px] border-primary/30 border-t-primary animate-spin" />
              ) : (
                <svg
                  className={`w-[18px] h-[18px] transition-colors duration-300 ${isFocused ? 'text-primary' : 'text-muted-foreground/40'}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              )}
            </div>

            {/* Input Field */}
            <div className="relative flex-1 h-[48px] z-10">
               {/* Ghost Text */}
               {ghostText && (
                  <div className="absolute inset-0 flex items-center pointer-events-none text-[15px] tracking-tight overflow-hidden whitespace-pre pl-0.5">
                    <span className="opacity-0">{query}</span>
                    <span className="text-muted-foreground/20">{ghostText}</span>
                  </div>
               )}

               <input
                 ref={inputRef}
                 type="text"
                 value={query}
                 onChange={(e) => {
                   updateQuery(e.target.value)
                   setShowSuggestions(true)
                 }}
                 onFocus={() => {
                   setIsFocused(true)
                   if(suggestions.length > 0) setShowSuggestions(true)
                 }}
                 onBlur={(e) => {
                   const relatedTarget = e.relatedTarget as Node | null
                   if (relatedTarget && suggestionsRef.current?.contains(relatedTarget)) return
                   setTimeout(() => setIsFocused(false), 150)
                 }}
                 onKeyDown={handleKeyDown}
                 placeholder="Search anything..."
                 className="w-full h-full bg-transparent border-none outline-none text-[15px] tracking-tight text-foreground placeholder:text-muted-foreground/30"
                 style={{ caretColor: 'hsl(var(--primary))' }}
                 spellCheck={false}
                 autoComplete="off"
               />
            </div>

            {/* Action Buttons */}
            <div className="pr-3 flex items-center gap-1.5 relative z-10">
               {/* Keyboard hint */}
               <AnimatePresence>
                 {!isFocused && !query && (
                   <motion.kbd
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     className="hidden sm:inline-flex items-center justify-center w-6 h-6 text-[11px] font-medium rounded-md border border-border/50 text-muted-foreground/30 bg-muted/30"
                   >
                     /
                   </motion.kbd>
                 )}
               </AnimatePresence>
               
               {/* Clear */}
               <AnimatePresence>
                 {query && (
                   <motion.button
                     initial={{ opacity: 0, scale: 0.8 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.8 }}
                     onClick={() => {
                       updateQuery('')
                       inputRef.current?.focus()
                     }}
                     className="p-1.5 rounded-lg transition-colors text-muted-foreground/40 hover:text-muted-foreground"
                   >
                     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                     </svg>
                   </motion.button>
                 )}
               </AnimatePresence>
               
               {/* Submit */}
               <AnimatePresence>
                  {query && (
                    <motion.button
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => handleSearch(query)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-primary-foreground transition-all"
                      style={{
                        background: 'linear-gradient(135deg, var(--gradient-from), var(--gradient-to))',
                        boxShadow: '0 2px 12px -2px var(--glow-color)',
                      }}
                    >
                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                       </svg>
                    </motion.button>
                  )}
               </AnimatePresence>
            </div>
        </div>
      </motion.div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestionsList && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 6, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 z-40 overflow-hidden"
          >
            <div className="rounded-xl overflow-hidden shadow-2xl border border-border/50 glass-heavy max-h-[60vh] overflow-y-auto">
               {suggestions.map((suggestion, index) => (
                 <div
                   key={index}
                   onClick={() => {
                     updateQuery(suggestion)
                     handleSearch(suggestion)
                     setShowSuggestions(false)
                   }}
                   onMouseEnter={() => setSelectedIndex(index)}
                   className={`px-4 py-3 cursor-pointer flex items-center gap-3 text-[14px] transition-colors duration-100 ${
                     selectedIndex === index ? 'bg-primary/5' : ''
                   }`}
                 >
                    <svg className={`w-3.5 h-3.5 shrink-0 ${selectedIndex === index ? 'text-primary' : 'text-muted-foreground/20'}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                    
                    <span className="text-foreground/80">
                      {suggestion.toLowerCase().startsWith(query.toLowerCase()) ? (
                        <>
                          <span className="text-primary font-medium">{query}</span>
                          <span className="opacity-60">{suggestion.slice(query.length)}</span>
                        </>
                      ) : (
                        suggestion
                      )}
                    </span>
                 </div>
               ))}
               
               <div className="px-4 py-2 border-t border-border/30 flex justify-between items-center bg-muted/20">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/30">suggestions</span>
                  <kbd className="px-1.5 py-0.5 text-[10px] rounded border border-border/30 text-muted-foreground/30">enter</kbd>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search History Dropdown */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 6, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 z-40 overflow-hidden"
          >
            <div className="rounded-xl overflow-hidden shadow-2xl border border-border/50 glass-heavy max-h-[60vh] overflow-y-auto">
              <div className="px-4 py-2 border-b border-border/30 flex justify-between items-center">
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/30">recent searches</span>
              </div>
              {history.slice(0, 8).map((entry) => (
                <div
                  key={entry.timestamp}
                  className="px-4 py-3 cursor-pointer flex items-center gap-3 text-[14px] transition-colors group hover:bg-primary/5"
                  onClick={() => {
                    updateQuery(entry.query)
                    handleSearch(entry.query)
                    setShowSuggestions(false)
                  }}
                >
                  <svg className="w-3.5 h-3.5 shrink-0 text-muted-foreground/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span className="flex-1 truncate text-foreground/70">{entry.query}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeEntry(entry.query)
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded transition-all text-muted-foreground/40 hover:text-destructive"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
