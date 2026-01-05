'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import ResultCard from '../../components/ResultCard'
import SearchBar from '../../components/SearchBar'
import { ResultCardSkeleton } from '../../components/Skeleton'
import { SearchResult } from '../../lib/google-search'
import { StreamingAnswer } from '../../components/StreamingAnswer'
import { motion, AnimatePresence } from 'framer-motion'

export default function ResultsClient() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''

  const [aiAnswer, setAiAnswer] = useState('')
  const [copied, setCopied] = useState(false)

  const [results, setResults] = useState<SearchResult[]>([])
  const [resultsLoading, setResultsLoading] = useState(true)
  const [resultsError, setResultsError] = useState('')

  const [followUpQuery, setFollowUpQuery] = useState('')

  // Search Results Effect
  useEffect(() => {
    if (!query) return

    setResultsLoading(true)
    setResultsError('')

    const fetchResults = async () => {
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query)}`
        )
        if (!response.ok) throw new Error('Failed to fetch results')
        const data = await response.json()
        setResults(data.results || [])
      } catch (error) {
        console.error('Error fetching results:', error)
        setResultsError('Could not fetch search results. Please try again.')
      } finally {
        setResultsLoading(false)
      }
    }

    fetchResults()
  }, [query])

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
      window.location.href = `/results?q=${encodeURIComponent(searchQuery)}`
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
    <main className="min-h-screen bg-[#fbfbfd] dark:bg-[#000000] pt-24 pb-16 transition-colors duration-1000">
      {/* Subtle Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-500/10 to-transparent dark:from-indigo-500/5 dark:to-transparent rounded-full blur-[100px]" />
      </div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        {/* Dynamic Query Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
             <SearchBar />
          </div>
          <div className="flex items-center gap-3">
             <button 
               onClick={shareResults}
               className="p-3 rounded-full bg-white dark:bg-zinc-800 border border-black/5 dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
               title="Share Search"
             >
               <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
               </svg>
             </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
            
            {/* LEFT COLUMN: Synthesis Hub (Answer) */}
            <div className="w-full lg:w-2/3 animate-fade-in-up">
              {/* Synthesis Card */}
              <div className="relative group p-6 md:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/10 shadow-xl overflow-hidden mb-10">
                 
                 {/* Header */}
                 <div className="flex items-center gap-3 mb-6 pb-4 border-b border-black/5 dark:border-white/5">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">AI Synthesis</span>
                    <div className="ml-auto">
                      <button 
                        onClick={copyToClipboard}
                        className="text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 font-medium transition-colors"
                      >
                         {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                 </div>

                 <StreamingAnswer 
                    query={query} 
                    onComplete={setAiAnswer}
                    className="text-[17px] leading-relaxed text-zinc-800 dark:text-zinc-200"
                 />

                 {/* Follow-up Console */}
                 <AnimatePresence>
                   {aiAnswer && (
                     <motion.div 
                       initial={{ opacity: 0, height: 0 }}
                       animate={{ opacity: 1, height: 'auto' }}
                       className="mt-6 pt-6 border-t border-black/5 dark:border-white/5"
                     >
                        <div className="relative">
                           <input 
                              type="text" 
                              value={followUpQuery}
                              onChange={(e) => setFollowUpQuery(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleFollowUp()}
                              placeholder="Ask a follow-up..."
                              className="w-full bg-zinc-50 dark:bg-black/20 border-none rounded-xl py-3 pl-4 pr-12 text-sm focus:ring-1 ring-zinc-200 dark:ring-zinc-700 transition-all outline-none"
                           />
                           <button 
                             onClick={handleFollowUp}
                             disabled={!followUpQuery.trim()}
                             className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                           >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                              </svg>
                           </button>
                        </div>
                     </motion.div>
                   )}
                 </AnimatePresence>
              </div>

              {/* Related/Citations Logic could go here */}
            </div>

            {/* RIGHT COLUMN: Web Index (Results) */}
            <div className="w-full lg:w-1/3 animate-fade-in-up animate-delay-100">
               <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-6 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-zinc-400" />
                  Visual Index
               </h3>
               
               <div className="space-y-4">
                  {resultsLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <ResultCardSkeleton key={i} />)
                  ) : results.length > 0 ? (
                    results.map((result, index) => (
                      <motion.div
                        key={result.link}
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
