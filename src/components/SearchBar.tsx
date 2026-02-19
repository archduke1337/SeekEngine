'use client'

/**
 * Search Bar Component
 * Aesthetic: Ultra-Premium with animated gradient border, shimmer effects, and glass morphism.
 */

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearch } from '../hooks/useSearch'
import { useSearchHistory } from '../hooks/useSearchHistory'
import { useTheme } from 'next-themes'

/* ── Animated gradient border wrapper ──────────────────────── */
function GlowBorder({ active, isDark, children }: { active: boolean; isDark: boolean; children: React.ReactNode }) {
  return (
    <div className="relative rounded-2xl" style={{ padding: active ? '1.5px' : '0px' }}>
      {/* Animated gradient ring */}
      {active && (
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden"
          style={{
            background: isDark
              ? 'conic-gradient(from var(--border-angle, 0deg), rgba(59,130,246,0.5), rgba(139,92,246,0.4), rgba(16,185,129,0.3), rgba(59,130,246,0.5))'
              : 'conic-gradient(from var(--border-angle, 0deg), rgba(59,130,246,0.35), rgba(139,92,246,0.25), rgba(16,185,129,0.2), rgba(59,130,246,0.35))',
            animation: 'border-spin 4s linear infinite',
          }}
        />
      )}
      <div className="relative rounded-2xl" style={{
        background: isDark ? '#0a0a0a' : '#fafafa',
      }}>
        {children}
      </div>
    </div>
  )
}

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

  // Global Keyboard Shortcuts
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

  // Outside click handler
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

  // Sync props
  useEffect(() => { onTyping?.(isTyping) }, [isTyping, onTyping])
  useEffect(() => { onFocusChange?.(isFocused) }, [isFocused, onFocusChange])

  // Reset selected index when suggestions change
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
      <GlowBorder active={isFocused} isDark={isDark}>
        <motion.div 
          layout
          className="relative z-50 group rounded-2xl transition-all duration-500 ease-out"
          initial={false}
          animate={isFocused ? { scale: 1.01 } : { scale: 1 }}
          style={{
            boxShadow: isFocused 
               ? (isDark 
                   ? '0 20px 60px -15px rgba(59,130,246,0.15), 0 10px 20px -10px rgba(0,0,0,0.4)' 
                   : '0 20px 60px -15px rgba(59,130,246,0.1), 0 10px 20px -10px rgba(0,0,0,0.05)')
               : (isDark 
                   ? '0 4px 16px -4px rgba(0,0,0,0.3)' 
                   : '0 4px 16px -4px rgba(0,0,0,0.06)')
          }}
        >
          <div 
             className="relative overflow-hidden rounded-2xl flex items-center transition-all duration-500"
             style={{
               background: isDark ? 'rgba(28, 28, 30, 0.7)' : 'rgba(255, 255, 255, 0.8)',
               backdropFilter: 'blur(40px) saturate(180%)',
               WebkitBackdropFilter: 'blur(40px) saturate(180%)',
               border: isDark ? '0.5px solid rgba(255,255,255,0.08)' : '0.5px solid rgba(0,0,0,0.06)',
             }}
          >
              {/* Shimmer overlay on focus */}
              <AnimatePresence>
                {isFocused && (
                  <motion.div
                    initial={{ x: '-100%', opacity: 0 }}
                    animate={{ x: '200%', opacity: 0.5 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: 'easeInOut' }}
                    className="absolute inset-0 z-0 pointer-events-none"
                    style={{
                      width: '30%',
                      background: isDark
                        ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)'
                        : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
                    }}
                  />
                )}
              </AnimatePresence>

              {/* Search Icon */}
              <div className="pl-4 pr-3 flex items-center justify-center relative z-10">
                {isLoading ? (
                  <div className="w-[18px] h-[18px] rounded-full border-[2px] border-t-transparent animate-spin"
                       style={{ borderColor: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)', borderTopColor: 'transparent' }} 
                  />
                ) : (
                  <motion.div
                    animate={isFocused ? { scale: 1.1 } : { scale: 1 }}
                    transition={{ duration: 0.2 }}
                    style={{ color: isFocused ? (isDark ? '#60a5fa' : '#3b82f6') : (isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)') }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </motion.div>
                )}
              </div>

              {/* Input Field */}
              <div className="relative flex-1 h-[52px] z-10">
                 {/* Ghost Text */}
                 {ghostText && (
                    <div className="absolute inset-0 flex items-center pointer-events-none text-[16px] tracking-tight overflow-hidden whitespace-pre pl-0.5">
                      <span className="opacity-0">{query}</span>
                      <span style={{ color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}>{ghostText}</span>
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
                     if (relatedTarget && suggestionsRef.current?.contains(relatedTarget)) {
                       return
                     }
                     setTimeout(() => setIsFocused(false), 150)
                   }}
                   onKeyDown={handleKeyDown}
                   placeholder="Ask anything..."
                   className="w-full h-full bg-transparent border-none outline-none text-[16px] font-normal tracking-tight selection:bg-blue-500/30"
                   style={{
                     fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                     color: isDark ? '#FFFFFF' : '#000000',
                     caretColor: '#3b82f6'
                   }}
                   spellCheck={false}
                   autoComplete="off"
                 />
                 
                 <style jsx>{`
                   input::placeholder {
                     color: ${isDark ? 'rgba(235,235,245,0.3)' : 'rgba(60,60,67,0.35)'};
                   }
                 `}</style>
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
                       transition={{ duration: 0.2 }}
                       className="hidden sm:inline-flex items-center justify-center w-6 h-6 text-[11px] font-mono font-medium rounded-md border"
                       style={{
                         color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)',
                         borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                         background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                       }}
                     >
                       /
                     </motion.kbd>
                   )}
                 </AnimatePresence>
                 
                 {/* Clear Button */}
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
                       className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                     >
                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                            style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}>
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                       </svg>
                     </motion.button>
                   )}
                 </AnimatePresence>
                 
                 {/* Submit Arrow */}
                 <AnimatePresence>
                    {query && (
                      <motion.button
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => handleSearch(query)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-shadow duration-300"
                        style={{
                          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                          color: '#FFFFFF',
                          boxShadow: '0 4px 14px -2px rgba(59,130,246,0.4)'
                        }}
                      >
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                         </svg>
                      </motion.button>
                    )}
                 </AnimatePresence>
              </div>
          </div>
        </motion.div>
      </GlowBorder>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestionsList && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 8, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 z-40 overflow-hidden"
          >
            <div 
              className="rounded-xl overflow-hidden shadow-2xl backdrop-blur-3xl border max-h-[60vh] overflow-y-auto"
              style={{
                background: isDark ? 'rgba(24, 24, 27, 0.85)' : 'rgba(255, 255, 255, 0.85)',
                borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
              }}
            >
               {suggestions.map((suggestion, index) => (
                 <div
                   key={index}
                   onClick={() => {
                     updateQuery(suggestion)
                     handleSearch(suggestion)
                     setShowSuggestions(false)
                   }}
                   onMouseEnter={() => setSelectedIndex(index)}
                   className={`px-4 py-3 cursor-pointer flex items-center gap-3 text-[15px] transition-colors duration-100 ${
                     selectedIndex === index 
                       ? (isDark ? 'bg-white/[0.06]' : 'bg-black/[0.04]') 
                       : ''
                   }`}
                 >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                       style={{ 
                         color: selectedIndex === index 
                           ? (isDark ? '#60a5fa' : '#3b82f6') 
                           : (isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)'),
                         flexShrink: 0,
                       }}
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    
                    <span style={{ color: isDark ? '#e4e4e7' : '#18181b' }}>
                      {suggestion.toLowerCase().startsWith(query.toLowerCase()) ? (
                        <>
                          <span className="font-semibold">{query}</span>
                          <span className="opacity-70">{suggestion.slice(query.length)}</span>
                        </>
                      ) : (
                        suggestion
                      )}
                    </span>
                 </div>
               ))}
               
               {/* Footer */}
               <div className="px-4 py-2 border-t flex justify-between items-center"
                    style={{ 
                      borderColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                      background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)'
                    }}>
                  <span className="text-[10px] font-semibold opacity-30 uppercase tracking-wider">Seek Intelligence</span>
                  <div className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded border opacity-25"
                         style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>↵</kbd>
                    <span className="text-[10px] opacity-25">search</span>
                  </div>
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
            animate={{ opacity: 1, y: 8, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 z-40 overflow-hidden"
          >
            <div 
              className="rounded-xl overflow-hidden shadow-2xl backdrop-blur-3xl border max-h-[60vh] overflow-y-auto"
              style={{
                background: isDark ? 'rgba(24, 24, 27, 0.85)' : 'rgba(255, 255, 255, 0.85)',
                borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
              }}
            >
              <div className="px-4 py-2 border-b flex justify-between items-center"
                   style={{ borderColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}>
                <span className="text-[11px] font-medium opacity-40 uppercase tracking-wider">Recent</span>
              </div>
              {history.slice(0, 8).map((entry) => (
                <div
                  key={entry.timestamp}
                  className="px-4 py-3 cursor-pointer flex items-center gap-3 text-[15px] transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.05] group"
                  onClick={() => {
                    updateQuery(entry.query)
                    handleSearch(entry.query)
                    setShowSuggestions(false)
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', flexShrink: 0 }}
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span className="flex-1 truncate" style={{ color: isDark ? '#e4e4e7' : '#18181b' }}>
                    {entry.query}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeEntry(entry.query)
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-all"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}>
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
