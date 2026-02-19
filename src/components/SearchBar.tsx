'use client'

/**
 * Search Bar Component
 * Aesthetic: Retro-Futuristic Terminal with neon accents and CRT glow
 */

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearch } from '../hooks/useSearch'
import { useSearchHistory } from '../hooks/useSearchHistory'
import { useTheme } from 'next-themes'

/* ── Neon glow border wrapper ──────────────────────── */
function NeonBorder({ active, isDark, children }: { active: boolean; isDark: boolean; children: React.ReactNode }) {
  const accentColor = isDark ? 'rgba(0,255,240,' : 'rgba(0,144,255,'
  return (
    <div className="relative rounded-xl" style={{ padding: active ? '1px' : '0px' }}>
      {active && (
        <div
          className="absolute inset-0 rounded-xl overflow-hidden"
          style={{
            background: `conic-gradient(from var(--border-angle, 0deg), ${accentColor}0.6), ${isDark ? 'rgba(180,0,255,0.3)' : 'rgba(144,0,224,0.2)'}, ${isDark ? 'rgba(255,0,106,0.3)' : 'rgba(224,0,90,0.2)'}, ${accentColor}0.6))`,
            animation: 'border-spin 3s linear infinite',
          }}
        />
      )}
      <div className="relative rounded-xl" style={{
        background: isDark ? '#0d0d14' : '#eaeaf0',
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

  const accentColor = isDark ? '#00fff0' : '#0090ff'

  return (
    <div className="relative w-full z-[100]" ref={suggestionsRef}>
      <NeonBorder active={isFocused} isDark={isDark}>
        <motion.div 
          layout
          className="relative z-50 group rounded-xl transition-all duration-500 ease-out"
          initial={false}
          animate={isFocused ? { scale: 1.01 } : { scale: 1 }}
          style={{
            boxShadow: isFocused 
               ? (isDark 
                   ? '0 0 30px -10px rgba(0,255,240,0.2), 0 10px 30px -10px rgba(0,0,0,0.5)' 
                   : '0 0 30px -10px rgba(0,144,255,0.15), 0 10px 30px -10px rgba(0,0,0,0.08)')
               : (isDark 
                   ? '0 4px 16px -4px rgba(0,0,0,0.4)' 
                   : '0 4px 16px -4px rgba(0,0,0,0.06)')
          }}
        >
          <div 
             className="relative overflow-hidden rounded-xl flex items-center transition-all duration-500"
             style={{
               background: isDark ? 'rgba(14, 14, 22, 0.9)' : 'rgba(240, 240, 248, 0.9)',
               backdropFilter: 'blur(20px)',
               WebkitBackdropFilter: 'blur(20px)',
               border: isDark ? '1px solid rgba(0,255,240,0.06)' : '1px solid rgba(0,144,255,0.08)',
             }}
          >
              {/* Scanline shimmer on focus */}
              <AnimatePresence>
                {isFocused && (
                  <motion.div
                    initial={{ y: '-100%', opacity: 0 }}
                    animate={{ y: '200%', opacity: 0.3 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2, ease: 'linear', repeat: Infinity }}
                    className="absolute left-0 right-0 h-[1px] z-0 pointer-events-none"
                    style={{
                      background: isDark
                        ? 'linear-gradient(90deg, transparent, rgba(0,255,240,0.15), transparent)'
                        : 'linear-gradient(90deg, transparent, rgba(0,144,255,0.12), transparent)',
                    }}
                  />
                )}
              </AnimatePresence>

              {/* Terminal Prompt */}
              <div className="pl-4 pr-2 flex items-center justify-center relative z-10">
                {isLoading ? (
                  <div className="w-[18px] h-[18px] rounded-full border-[2px] border-t-transparent animate-spin"
                       style={{ borderColor: `${accentColor}66`, borderTopColor: 'transparent' }} 
                  />
                ) : (
                  <motion.span
                    animate={isFocused ? { opacity: [0.5, 1, 0.5] } : { opacity: 0.35 }}
                    transition={isFocused ? { duration: 2, repeat: Infinity } : {}}
                    className="font-mono text-sm font-bold"
                    style={{ color: isFocused ? accentColor : (isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)') }}
                  >
                    {'>'}
                  </motion.span>
                )}
              </div>

              {/* Input Field */}
              <div className="relative flex-1 h-[48px] z-10">
                 {/* Ghost Text */}
                 {ghostText && (
                    <div className="absolute inset-0 flex items-center pointer-events-none font-mono text-[15px] tracking-tight overflow-hidden whitespace-pre pl-0.5">
                      <span className="opacity-0">{query}</span>
                      <span style={{ color: isDark ? 'rgba(0,255,240,0.2)' : 'rgba(0,144,255,0.2)' }}>{ghostText}</span>
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
                   placeholder="query the machine..."
                   className="w-full h-full bg-transparent border-none outline-none font-mono text-[15px] tracking-tight"
                   style={{
                     color: isDark ? '#e0e0e8' : '#0a0a14',
                     caretColor: accentColor,
                   }}
                   spellCheck={false}
                   autoComplete="off"
                 />
                 
                 <style jsx>{`
                   input::placeholder {
                     color: ${isDark ? 'rgba(0,255,240,0.2)' : 'rgba(0,144,255,0.25)'};
                     font-style: italic;
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
                       className="hidden sm:inline-flex items-center justify-center w-6 h-6 font-mono text-[11px] font-medium rounded border"
                       style={{
                         color: isDark ? 'rgba(0,255,240,0.25)' : 'rgba(0,144,255,0.3)',
                         borderColor: isDark ? 'rgba(0,255,240,0.1)' : 'rgba(0,144,255,0.1)',
                         background: isDark ? 'rgba(0,255,240,0.03)' : 'rgba(0,144,255,0.03)',
                       }}
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
                       className="p-1.5 rounded-lg transition-colors"
                       style={{ color: isDark ? 'rgba(0,255,240,0.3)' : 'rgba(0,144,255,0.4)' }}
                     >
                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
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
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold transition-all"
                        style={{
                          background: isDark 
                            ? 'linear-gradient(135deg, rgba(0,255,240,0.15), rgba(180,0,255,0.15))'
                            : 'linear-gradient(135deg, rgba(0,144,255,0.15), rgba(144,0,224,0.15))',
                          color: accentColor,
                          border: `1px solid ${isDark ? 'rgba(0,255,240,0.2)' : 'rgba(0,144,255,0.2)'}`,
                          boxShadow: `0 0 12px -4px ${isDark ? 'rgba(0,255,240,0.2)' : 'rgba(0,144,255,0.2)'}`,
                        }}
                      >
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                         </svg>
                      </motion.button>
                    )}
                 </AnimatePresence>
              </div>
          </div>
        </motion.div>
      </NeonBorder>

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
            <div 
              className="rounded-xl overflow-hidden shadow-2xl border max-h-[60vh] overflow-y-auto"
              style={{
                background: isDark ? 'rgba(14, 14, 22, 0.95)' : 'rgba(240, 240, 248, 0.95)',
                borderColor: isDark ? 'rgba(0,255,240,0.06)' : 'rgba(0,144,255,0.08)',
                backdropFilter: 'blur(20px)',
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
                   className={`px-4 py-3 cursor-pointer flex items-center gap-3 font-mono text-[14px] transition-colors duration-100 ${
                     selectedIndex === index 
                       ? (isDark ? 'bg-[rgba(0,255,240,0.05)]' : 'bg-[rgba(0,144,255,0.05)]') 
                       : ''
                   }`}
                 >
                    <span className="font-mono text-xs" style={{ 
                      color: selectedIndex === index ? accentColor : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'),
                    }}>{'>'}</span>
                    
                    <span style={{ color: isDark ? '#c0c0d0' : '#1a1a2a' }}>
                      {suggestion.toLowerCase().startsWith(query.toLowerCase()) ? (
                        <>
                          <span style={{ color: accentColor }}>{query}</span>
                          <span className="opacity-60">{suggestion.slice(query.length)}</span>
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
                      borderColor: isDark ? 'rgba(0,255,240,0.04)' : 'rgba(0,144,255,0.06)',
                      background: isDark ? 'rgba(0,255,240,0.02)' : 'rgba(0,144,255,0.02)'
                    }}>
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: `${accentColor}44` }}>neural index</span>
                  <div className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 font-mono text-[10px] rounded border" style={{ 
                      borderColor: isDark ? 'rgba(0,255,240,0.08)' : 'rgba(0,144,255,0.1)',
                      color: `${accentColor}44`,
                    }}>↵</kbd>
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
            animate={{ opacity: 1, y: 6, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 z-40 overflow-hidden"
          >
            <div 
              className="rounded-xl overflow-hidden shadow-2xl border max-h-[60vh] overflow-y-auto"
              style={{
                background: isDark ? 'rgba(14, 14, 22, 0.95)' : 'rgba(240, 240, 248, 0.95)',
                borderColor: isDark ? 'rgba(0,255,240,0.06)' : 'rgba(0,144,255,0.08)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div className="px-4 py-2 border-b flex justify-between items-center"
                   style={{ borderColor: isDark ? 'rgba(0,255,240,0.04)' : 'rgba(0,144,255,0.06)' }}>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: `${accentColor}44` }}>memory_log</span>
              </div>
              {history.slice(0, 8).map((entry) => (
                <div
                  key={entry.timestamp}
                  className="px-4 py-3 cursor-pointer flex items-center gap-3 font-mono text-[14px] transition-colors group"
                  style={{ color: isDark ? '#c0c0d0' : '#1a1a2a' }}
                  onClick={() => {
                    updateQuery(entry.query)
                    handleSearch(entry.query)
                    setShowSuggestions(false)
                  }}
                >
                  <span className="text-xs" style={{ color: `${accentColor}33` }}>{'~'}</span>
                  <span className="flex-1 truncate">{entry.query}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeEntry(entry.query)
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded transition-all"
                    style={{ color: isDark ? 'rgba(255,0,106,0.5)' : 'rgba(224,0,90,0.5)' }}
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
