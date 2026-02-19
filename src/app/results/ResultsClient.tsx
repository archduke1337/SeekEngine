'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import ResultCard from '../../components/ResultCard'
import SearchBar from '../../components/SearchBar'
import { ResultCardSkeleton } from '../../components/Skeleton'
import { SearchResult } from '../../lib/google-search'
import { StreamingAnswer } from '../../components/StreamingAnswer'
import { useSearchHistory } from '../../hooks/useSearchHistory'
import { motion, AnimatePresence } from 'framer-motion'
import LivingIcon from '../../components/LivingIcon'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from 'next-themes'

const TIME_OPTIONS = [
  { label: 'Any time', value: '' },
  { label: 'Past hour', value: 'h' },
  { label: 'Past day', value: 'd' },
  { label: 'Past week', value: 'w' },
  { label: 'Past month', value: 'm' },
  { label: 'Past year', value: 'y' },
] as const

export default function ResultsClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get('q') || ''
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const [aiAnswer, setAiAnswer] = useState('')
  const [copied, setCopied] = useState(false)

  const [results, setResults] = useState<SearchResult[]>([])
  const [resultsLoading, setResultsLoading] = useState(true)
  const [resultsError, setResultsError] = useState('')

  const [followUpQuery, setFollowUpQuery] = useState('')
  const followUpInputRef = useRef<HTMLInputElement>(null)
  const searchAbortRef = useRef<AbortController | null>(null)
  const { addEntry } = useSearchHistory()
  const [timeFilter, setTimeFilter] = useState('')

  const accentColor = isDark ? '#00fff0' : '#0090ff'
  const accentSecondary = isDark ? '#ff006a' : '#e0005a'
  const surfaceBg = isDark ? 'rgba(14,14,22,0.7)' : 'rgba(240,240,248,0.8)'
  const borderColor = isDark ? 'rgba(0,255,240,0.06)' : 'rgba(0,144,255,0.08)'

  // Record search in history
  useEffect(() => {
    if (query) addEntry(query)
  }, [query, addEntry])

  // Global Keybinds
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === '/' && !document.activeElement?.matches('input, textarea')) {
        e.preventDefault()
        followUpInputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Search Results Effect
  useEffect(() => {
    if (!query) return

    setResultsLoading(true)
    setResultsError('')
    setResults([])
    setAiAnswer('')
    setFollowUpQuery('')
    setCopied(false)

    if (searchAbortRef.current) {
      searchAbortRef.current.abort()
    }
    const controller = new AbortController()
    searchAbortRef.current = controller

    const fetchResults = async () => {
      try {
        const params = new URLSearchParams({ q: query })
        if (timeFilter) params.set('time', timeFilter)
        const response = await fetch(
          `/api/search?${params.toString()}`,
          { signal: controller.signal }
        )
        if (!response.ok) throw new Error('Failed to fetch results')
        const data = await response.json()
        if (!controller.signal.aborted) {
          setResults(data.results || [])
        }
      } catch (error) {
        if ((error as Error).name === 'AbortError') return
        console.error('Error fetching results:', error)
        if (!controller.signal.aborted) {
          setResultsError('Could not fetch search results. Please try again.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setResultsLoading(false)
        }
      }
    }

    fetchResults()

    return () => {
      controller.abort()
    }
  }, [query, timeFilter])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(aiAnswer)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareResults = () => {
    if (navigator.share) {
      navigator.share({
        title: `SeekEngine Search: ${query}`,
        text: `Check out these results for "${query}" on SeekEngine`,
        url: window.location.href,
      })
    } else {
      copyToClipboard()
    }
  }

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      router.push(`/results?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  function handleFollowUp() {
    if (followUpQuery.trim()) {
      handleSearch(followUpQuery)
    }
  }

  if (!query) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 pt-24 transition-colors duration-500"
            style={{ background: isDark ? '#0a0a0f' : '#f0f0f5' }}>
        <div className="w-full max-w-2xl space-y-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-display font-bold tracking-tight"
              style={{ color: isDark ? '#e0e0f0' : '#0a0a1a' }}>
            Query the Machine
          </h1>
          <SearchBar autoFocus />
        </div>
      </main>
    )
  }

  return (
    <main className="w-full flex-1 pt-24 pb-16 transition-colors duration-700 flex flex-col"
          style={{ background: isDark ? '#0a0a0f' : '#f0f0f5' }}>
      {/* Ambient Background — Retro Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full blur-[100px]"
             style={{ background: isDark
               ? 'radial-gradient(circle, rgba(0,255,240,0.04) 0%, rgba(180,0,255,0.02) 50%, transparent 80%)'
               : 'radial-gradient(circle, rgba(0,144,255,0.06) 0%, rgba(144,0,224,0.03) 50%, transparent 80%)'
             }} />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full blur-[80px]"
             style={{ background: isDark
               ? 'radial-gradient(circle, rgba(255,0,106,0.03) 0%, transparent 70%)'
               : 'radial-gradient(circle, rgba(224,0,90,0.04) 0%, transparent 70%)'
             }} />
      </div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        {/* Header Navigation */}
        <header className="flex items-center justify-between py-6 mb-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <Image src="/logo.png" alt="SeekEngine" width={28} height={28} className="transition-transform group-hover:scale-90" />
              <span className="font-display font-bold text-lg tracking-tight transition-opacity group-hover:opacity-70"
                    style={{ color: isDark ? '#e0e0f0' : '#0a0a1a' }}>
                SeekEngine
              </span>
            </Link>

            <div className="flex gap-3">
               <button 
                 onClick={shareResults}
                 className="px-4 py-2 rounded-lg font-mono text-xs font-medium transition-all active:scale-95"
                 style={{
                   background: surfaceBg,
                   border: `1px solid ${borderColor}`,
                   color: isDark ? '#6b6b80' : '#6b6b80',
                 }}
                 onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = accentColor; (e.currentTarget as HTMLElement).style.borderColor = accentColor + '33' }}
                 onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#6b6b80'; (e.currentTarget as HTMLElement).style.borderColor = borderColor }}
               >
                 SHARE
               </button>
            </div>
        </header>

        {/* Query Title */}
        <div className="mb-10 animate-fade-in-up">
           <div className="flex items-center gap-2 mb-3">
             <div className="w-1 h-4 rounded-full" style={{ background: accentColor, opacity: 0.6 }} />
             <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em]"
                   style={{ color: isDark ? '#4a4a5a' : '#8a8a9a' }}>
               Engine Outcome
             </span>
           </div>
           <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight leading-tight"
               style={{ color: isDark ? '#e0e0f0' : '#0a0a1a' }}>
             {query}
           </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
            
            {/* LEFT COLUMN: Synthesis Hub */}
            <div className="w-full lg:w-2/3 animate-fade-in-up">
              <div className="relative group p-6 md:p-8 rounded-xl overflow-hidden mb-10 transition-all duration-300"
                   style={{
                     background: surfaceBg,
                     border: `1px solid ${borderColor}`,
                   }}>
                 
                 {/* Top neon accent line */}
                 <div className="absolute top-0 left-0 right-0 h-[1px]"
                      style={{ background: `linear-gradient(90deg, transparent, ${accentColor}33, ${isDark ? '#b400ff' : '#9000e0'}22, transparent)` }} />
                 
                 {/* Header */}
                 <div className="flex items-center gap-3 mb-6 pb-4"
                      style={{ borderBottom: `1px solid ${borderColor}` }}>
                    <LivingIcon color={isDark ? 'bg-[#00fff0]' : 'bg-[#0090ff]'} size="w-2 h-2" />
                    <span className="text-sm font-mono font-semibold tracking-tight" style={{ color: isDark ? '#c0c0d0' : '#2a2a3a' }}>
                      Deep Analysis
                    </span>
                    <div className="ml-auto flex items-center gap-2">
                      <button 
                        onClick={copyToClipboard}
                        className="flex items-center gap-1.5 text-xs font-mono font-medium transition-colors px-2 py-1 rounded-lg"
                        style={{ color: isDark ? '#4a4a5a' : '#8a8a9a' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = accentColor }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = isDark ? '#4a4a5a' : '#8a8a9a' }}
                      >
                         <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                           <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                           <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                         </svg>
                         {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                 </div>

                 <StreamingAnswer 
                    query={query} 
                    onComplete={setAiAnswer}
                    onRegenerate={() => setAiAnswer('')}
                    className="text-[17px] leading-relaxed"
                    style={{ color: isDark ? '#c0c0d0' : '#2a2a3a' }}
                 />

                 {/* Follow-up Console */}
                 <AnimatePresence>
                   {aiAnswer && (
                     <motion.div 
                       initial={{ opacity: 0, height: 0 }}
                       animate={{ opacity: 1, height: 'auto' }}
                       className="mt-6 pt-6"
                       style={{ borderTop: `1px solid ${borderColor}` }}
                     >
                        <div className="relative">
                           <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm"
                                 style={{ color: accentColor, opacity: 0.5 }}>&gt;</span>
                           <input 
                              ref={followUpInputRef}
                              type="text" 
                              value={followUpQuery}
                              onChange={(e) => setFollowUpQuery(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleFollowUp()
                                if (e.key === 'Escape') followUpInputRef.current?.blur()
                              }}
                              placeholder="follow-up query..."
                              className="w-full rounded-lg py-3 pl-9 pr-14 text-sm font-mono transition-all outline-none"
                              style={{
                                background: isDark ? 'rgba(10,10,16,0.6)' : 'rgba(230,230,240,0.6)',
                                border: `1px solid ${borderColor}`,
                                color: isDark ? '#c0c0d0' : '#2a2a3a',
                                caretColor: accentColor,
                              }}
                              onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = accentColor + '33' }}
                              onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = borderColor }}
                           />
                           <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                             <kbd className="hidden sm:inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-mono rounded"
                                  style={{ color: isDark ? '#4a4a5a' : '#8a8a9a', border: `1px solid ${borderColor}` }}>/</kbd>
                             <button 
                               onClick={handleFollowUp}
                               disabled={!followUpQuery.trim()}
                               className="p-1.5 rounded-lg transition-all active:scale-95 disabled:opacity-30"
                               style={{ background: accentColor, color: '#0a0a0f' }}
                             >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                             </button>
                           </div>
                        </div>
                     </motion.div>
                   )}
                 </AnimatePresence>
              </div>
            </div>

            {/* RIGHT COLUMN: Web Index */}
            <div className="w-full lg:w-1/3 animate-fade-in-up animate-delay-100">
               <h3 className="text-[11px] font-mono font-semibold uppercase tracking-[0.15em] mb-4 flex items-center gap-2"
                   style={{ color: isDark ? '#4a4a5a' : '#8a8a9a' }}>
                  <LivingIcon color={isDark ? 'bg-[#00fff0]/40' : 'bg-[#0090ff]/40'} size="w-1.5 h-1.5" />
                  Web Sources
               </h3>

               {/* Time Filter */}
               <div className="flex flex-wrap gap-1.5 mb-5">
                 {TIME_OPTIONS.map(opt => (
                   <button
                     key={opt.value}
                     onClick={() => setTimeFilter(opt.value)}
                     className="px-3 py-1.5 rounded-lg text-[11px] font-mono font-medium transition-all duration-200"
                     style={{
                       background: timeFilter === opt.value
                         ? (isDark ? accentColor : accentColor)
                         : (isDark ? 'rgba(14,14,22,0.6)' : 'rgba(230,230,240,0.6)'),
                       color: timeFilter === opt.value
                         ? '#0a0a0f'
                         : (isDark ? '#6b6b80' : '#6b6b80'),
                       border: timeFilter === opt.value
                         ? `1px solid ${accentColor}`
                         : `1px solid ${borderColor}`,
                     }}
                   >
                     {opt.label}
                   </button>
                 ))}
               </div>
               
               <div className="space-y-3">
                  {resultsLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <ResultCardSkeleton key={i} />)
                  ) : resultsError ? (
                    <div className="p-6 text-center rounded-xl" style={{ border: `1px dashed ${accentSecondary}44` }}>
                        <p className="text-sm font-mono" style={{ color: accentSecondary }}>{resultsError}</p>
                    </div>
                  ) : results.length > 0 ? (
                    results.map((result, index) => (
                      <motion.div
                        key={result.link}
                        data-result-index={index + 1}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <ResultCard result={result} />
                      </motion.div>
                    ))
                  ) : (
                    <div className="p-6 text-center rounded-xl" style={{ border: `1px dashed ${borderColor}` }}>
                        <p className="text-sm font-mono" style={{ color: isDark ? '#4a4a5a' : '#8a8a9a' }}>No adjacent nodes found.</p>
                    </div>
                  )}
               </div>
            </div>
        </div>
      </div>
    </main>
  )
}
