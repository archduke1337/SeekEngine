'use client'

/**
 * Search Bar Component
 * Aesthetic: Ultra-Premium Apple "Realism" Glass
 * Features: Deep blur, physical borders, squircle smoothing, and organic motion.
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

  // Global Keyboard Shortcuts
  useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      // Focus on '/'
      if (e.key === '/' && !isFocused && !inputRef.current?.matches(':focus')) {
        e.preventDefault()
        inputRef.current?.focus()
      }
      // Blur on 'Escape'
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
      <motion.div 
        layout
        className={`relative z-50 group rounded-2xl transition-all duration-500 ease-out`}
        initial={false}
        animate={isFocused ? { scale: 1.02 } : { scale: 1 }}
        style={{
          boxShadow: isFocused 
             ? (isDark ? '0 0 0 1px rgba(255,255,255,0.1), 0 20px 40px -10px rgba(0,0,0,0.5)' : '0 0 0 1px rgba(0,0,0,0.05), 0 20px 40px -10px rgba(0,0,0,0.1)')
             : 'none'
        }}
      >
        <div 
           className="relative overflow-hidden rounded-2xl flex items-center transition-all duration-300"
           style={{
             // SwiftUI "SystemUltraThinMaterial" approximation
             background: isDark ? 'rgba(30, 30, 30, 0.55)' : 'rgba(245, 245, 245, 0.65)',
             backdropFilter: 'blur(30px) saturate(160%)',
             WebkitBackdropFilter: 'blur(30px) saturate(160%)',
             
             // Native-like hairline border
             border: isDark ? '0.5px solid rgba(255,255,255,0.12)' : '0.5px solid rgba(0,0,0,0.08)',
             
             // Subtle depth, no heavy drop shadows default
             boxShadow: isFocused 
               ? (isDark ? '0 0 0 1px rgba(255,255,255,0.15), 0 10px 40px -10px rgba(0,0,0,0.8)' : '0 0 0 1px rgba(0,0,0,0.05), 0 10px 40px -10px rgba(0,0,0,0.1)')
               : (isDark ? 'inset 0 1px 0 rgba(255,255,255,0.05)' : 'inset 0 1px 0 rgba(255,255,255,0.4), 0 2px 10px rgba(0,0,0,0.02)'),
           }}
        >
            {/* Search Icon - SF Symbol Style */}
            <div className="pl-4 pr-3 flex items-center justify-center opacity-60">
              {isLoading ? (
                <div className="w-4 h-4 rounded-full border-[2px] border-t-transparent animate-spin"
                     style={{ borderColor: isDark ? '#FFF' : '#000', borderTopColor: 'transparent' }} 
                />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              )}
            </div>

            {/* Input Field */}
            <div className="relative flex-1 h-12">
               {/* Ghost Text */}
               {ghostText && (
                  <div className="absolute inset-0 flex items-center pointer-events-none text-[17px] tracking-tight overflow-hidden whitespace-pre pl-0.5">
                    <span className="opacity-0">{query}</span>
                    <span style={{ color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)' }}>{ghostText}</span>
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
                   // Only blur if the new focus target is outside the search bar container
                   const relatedTarget = e.relatedTarget as Node | null
                   if (relatedTarget && suggestionsRef.current?.contains(relatedTarget)) {
                     return // Focus is moving to suggestions dropdown, don't blur
                   }
                   setTimeout(() => setIsFocused(false), 150)
                 }}
                 onKeyDown={handleKeyDown}
                 placeholder="Search"
                 className="w-full h-full bg-transparent border-none outline-none text-[17px] font-normal tracking-tight selection:bg-blue-500/30"
                 style={{
                   fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                   color: isDark ? '#FFFFFF' : '#000000',
                   caretColor: '#007AFF'
                 }}
                 spellCheck={false}
                 autoComplete="off"
               />
               
               <style jsx>{`
                 input::placeholder {
                   color: ${isDark ? 'rgba(235,235,245,0.4)' : 'rgba(60,60,67,0.4)'};
                 }
               `}</style>
            </div>

            {/* Action Buttons */}
            <div className="pr-2 flex items-center gap-2">
               {/* Clear Button - Only show if query exists */}
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
                     className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                   >
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                          style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}>
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                     </svg>
                   </motion.button>
                 )}
               </AnimatePresence>
               
               {/* Submit Arrow - Only show if query exists */}
               <AnimatePresence>
                  {query && (
                    <motion.button
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSearch(query)}
                      className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
                      style={{
                        background: isDark ? '#3A3A3C' : '#007AFF', // Standard Apple Blue or Gray
                        color: '#FFFFFF'
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

      {/* Suggestions Dropdown - Floating Detached Style */}
      <AnimatePresence>
        {showSuggestionsList && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 8, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 z-40 overflow-hidden"
          >
            <div 
              className="rounded-xl overflow-hidden shadow-2xl backdrop-blur-3xl border max-h-[60vh] overflow-y-auto"
              style={{
                background: isDark ? 'rgba(30, 30, 30, 0.70)' : 'rgba(255, 255, 255, 0.75)',
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.4)',
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
                   className={`px-5 py-3 cursor-pointer flex items-center gap-3 text-[17px] transition-colors ${
                     selectedIndex === index 
                       ? (isDark ? 'bg-white/10' : 'bg-black/5') 
                       : ''
                   }`}
                 >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                       style={{ 
                         color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
                         opacity: selectedIndex === index ? 1 : 0.7
                       }}
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    
                    <span style={{ color: isDark ? '#FFF' : '#000' }}>
                      {/* Highlight matching part if simple prefix */}
                      {suggestion.toLowerCase().startsWith(query.toLowerCase()) ? (
                        <>
                          <span className="font-semibold">{query}</span>
                          <span className="opacity-80">{suggestion.slice(query.length)}</span>
                        </>
                      ) : (
                        suggestion
                      )}
                    </span>
                 </div>
               ))}
               
               {/* Quick Actions Footer (Optional) */}
               <div className="px-5 py-2 border-t flex justify-between items-center bg-black/5 dark:bg-white/5"
                    style={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                  <span className="text-xs font-medium opacity-50 uppercase tracking-wider">Seek Intelligence</span>
                  <span className="text-xs opacity-40">Press ↵ to search</span>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search History Dropdown */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 8, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 z-40 overflow-hidden"
          >
            <div 
              className="rounded-xl overflow-hidden shadow-2xl backdrop-blur-3xl border max-h-[60vh] overflow-y-auto"
              style={{
                background: isDark ? 'rgba(30, 30, 30, 0.70)' : 'rgba(255, 255, 255, 0.75)',
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.4)',
              }}
            >
              <div className="px-5 py-2 border-b flex justify-between items-center"
                   style={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                <span className="text-xs font-medium opacity-50 uppercase tracking-wider">Recent Searches</span>
              </div>
              {history.slice(0, 8).map((entry, index) => (
                <div
                  key={entry.timestamp}
                  className="px-5 py-3 cursor-pointer flex items-center gap-3 text-[17px] transition-colors hover:bg-black/5 dark:hover:bg-white/10 group"
                  onClick={() => {
                    updateQuery(entry.query)
                    handleSearch(entry.query)
                    setShowSuggestions(false)
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span className="flex-1 truncate" style={{ color: isDark ? '#FFF' : '#000' }}>
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
                      style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>
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
