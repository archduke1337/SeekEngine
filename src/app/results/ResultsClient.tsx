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

    // Reset state for new query
    setResultsLoading(true)
    setResultsError('')
    setResults([])
    setAiAnswer('')
    setFollowUpQuery('')
    setCopied(false)

    // Abort previous in-flight search request
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
      <main className="min-h-screen flex flex-col items-center justify-center px-4 pt-24 bg-white dark:bg-black transition-colors duration-500">
        <div className="w-full max-w-2xl space-y-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-black dark:text-white">
            Search with AI
          </h1>
          <SearchBar autoFocus />
        </div>
      </main>
    )
  }

  return (
    <main className="w-full flex-1 bg-[#fafafa] dark:bg-[#000000] pt-24 pb-16 transition-colors duration-700 flex flex-col">
      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/[0.06] via-indigo-500/[0.04] to-transparent dark:from-blue-500/[0.04] dark:via-indigo-500/[0.02] dark:to-transparent rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-gradient-to-tr from-emerald-500/[0.04] to-transparent dark:from-emerald-500/[0.02] dark:to-transparent rounded-full blur-[80px]" />
      </div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        {/* Header Navigation */}
        <header className="flex items-center justify-between py-6 mb-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 bg-black dark:bg-white rounded-xl flex items-center justify-center transition-all group-hover:scale-95 group-hover:rounded-lg shadow-sm">
                <svg className="w-4 h-4 text-white dark:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <span className="font-bold text-lg tracking-tight text-black dark:text-white group-hover:opacity-70 transition-opacity">SeekEngine</span>
            </Link>

            <div className="flex gap-3">
               <button 
                 onClick={shareResults}
                 className="px-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700 transition-all active:scale-95"
               >
                 Share
               </button>
            </div>
        </header>

        {/* Query Title */}
        <div className="mb-10 animate-fade-in-up">
           <div className="flex items-center gap-2 mb-3">
             <div className="w-1 h-4 rounded-full bg-blue-500/60 dark:bg-blue-400/60" />
             <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
               Engine Outcome
             </span>
           </div>
           <h1 className="text-3xl md:text-5xl font-bold text-black dark:text-white tracking-tight leading-tight">
             {query}
           </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
            
            {/* LEFT COLUMN: Synthesis Hub (Answer) */}
            <div className="w-full lg:w-2/3 animate-fade-in-up">
              {/* Synthesis Card */}
              <div className="relative group p-6 md:p-8 rounded-3xl bg-white dark:bg-zinc-900/80 border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden mb-10 transition-shadow duration-300 hover:shadow-lg">
                 
                 {/* Subtle gradient border accent at top */}
                 <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
                 
                 {/* Header */}
                 <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                    <LivingIcon color="bg-blue-500" size="w-2 h-2" />
                    <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 tracking-tight">Deep Analysis</span>
                    <div className="ml-auto flex items-center gap-2">
                      <button 
                        onClick={copyToClipboard}
                        className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 font-medium transition-colors px-2 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
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
                    className="text-[17px] leading-relaxed text-zinc-800 dark:text-zinc-200"
                 />

                 {/* Follow-up Console */}
                 <AnimatePresence>
                   {aiAnswer && (
                     <motion.div 
                       initial={{ opacity: 0, height: 0 }}
                       animate={{ opacity: 1, height: 'auto' }}
                       className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800"
                     >
                        <div className="relative">
                           <input 
                              ref={followUpInputRef}
                              type="text" 
                              value={followUpQuery}
                              onChange={(e) => setFollowUpQuery(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleFollowUp()
                                if (e.key === 'Escape') followUpInputRef.current?.blur()
                              }}
                              placeholder="Ask a follow-up..."
                              className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-zinc-700/50 rounded-xl py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                           />
                           <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                             <kbd className="hidden sm:inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-mono text-zinc-400 border border-zinc-200 dark:border-zinc-700 rounded">/</kbd>
                             <button 
                               onClick={handleFollowUp}
                               disabled={!followUpQuery.trim()}
                               className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-30 disabled:hover:bg-blue-600 transition-all active:scale-95"
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

              {/* Related/Citations Logic could go here */}
            </div>

            {/* RIGHT COLUMN: Web Index (Results) */}
            <div className="w-full lg:w-1/3 animate-fade-in-up animate-delay-100">
               <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2">
                  <LivingIcon color="bg-zinc-400" size="w-1.5 h-1.5" />
                  Web Sources
               </h3>

               {/* Time Filter */}
               <div className="flex flex-wrap gap-1.5 mb-5">
                 {TIME_OPTIONS.map(opt => (
                   <button
                     key={opt.value}
                     onClick={() => setTimeFilter(opt.value)}
                     className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 ${
                       timeFilter === opt.value
                         ? 'bg-zinc-900 dark:bg-white text-white dark:text-black shadow-sm'
                         : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                     }`}
                   >
                     {opt.label}
                   </button>
                 ))}
               </div>
               
               <div className="space-y-4">
                  {resultsLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <ResultCardSkeleton key={i} />)
                  ) : resultsError ? (
                    <div className="p-6 text-center rounded-2xl border border-dashed border-red-200 dark:border-red-800">
                        <p className="text-sm text-red-500 dark:text-red-400">{resultsError}</p>
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
                    <div className="p-6 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                        <p className="text-sm text-zinc-500">No adjacent nodes found.</p>
                    </div>
                  )}
               </div>
            </div>
        </div>
      </div>
    </main>
  )
}
