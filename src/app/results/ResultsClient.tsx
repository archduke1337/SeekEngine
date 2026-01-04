'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import ResultCard from '../../components/ResultCard'
import SearchBar from '../../components/SearchBar'
import { AnswerSkeleton, ResultCardSkeleton } from '../../components/Skeleton'
import { SearchResult } from '../../lib/google-search'
import TypewriterText from '../../components/TypewriterText'
import { motion, AnimatePresence } from 'framer-motion'

export default function ResultsClient() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''

  const [aiAnswer, setAiAnswer] = useState('')
  const [aiLoading, setAiLoading] = useState(true)
  const [aiError, setAiError] = useState('')
  const [copied, setCopied] = useState(false)

  const [results, setResults] = useState<SearchResult[]>([])
  const [resultsLoading, setResultsLoading] = useState(true)
  const [resultsError, setResultsError] = useState('')

  const [followUpQuery, setFollowUpQuery] = useState('')

  useEffect(() => {
    if (!query) return

    setAiLoading(true)
    setAiError('')

    const fetchAnswer = async () => {
      try {
        const response = await fetch(
          `/api/ai/answer?q=${encodeURIComponent(query)}`
        )
        if (!response.ok) throw new Error('Failed to fetch answer')
        const data = await response.json()
        setAiAnswer(data.answer || '')
      } catch (error) {
        console.error('Error fetching answer:', error)
        setAiError('Could not generate AI answer. Try refining your search.')
      } finally {
        setAiLoading(false)
      }
    }

    fetchAnswer()
  }, [query])

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

  function handleFollowUp() {
    if (followUpQuery.trim()) {
      setFollowUpQuery('')
      window.history.pushState(
        null,
        '',
        `/results?q=${encodeURIComponent(followUpQuery)}`
      )
      window.location.reload()
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
    <main className="min-h-screen bg-[#fbfbfd] dark:bg-[#000000] pt-32 pb-16 transition-colors duration-1000">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[800px] h-[600px] bg-gradient-to-b from-slate-100/50 to-transparent dark:from-slate-900/20 dark:to-transparent rounded-full blur-[120px] opacity-60" />
        <div className="fixed inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
      </div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        {/* Dynamic Query Header */}
        <div className="mb-8 md:mb-12 animate-fade-in-up flex flex-col sm:flex-row sm:items-end justify-between border-b border-black/5 dark:border-white/5 pb-6 md:pb-8 gap-6 sm:gap-4">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-[0.4em] font-black text-slate-400">Engine Output</p>
            <h1 className="text-3xl sm:text-5xl font-black text-black dark:text-white tracking-tighter line-clamp-2">
              {query}
            </h1>
          </div>
          <button 
            onClick={shareResults}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3 rounded-full bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border border-black/5 dark:border-white/5 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-black dark:hover:text-white transition-all active:scale-95 shadow-sm"
          >
            Share Insight
          </button>
        </div>

        {/* Synthesis Hub - RAG Summary */}
        <section className="mb-12 md:mb-16 animate-fade-in-up animate-delay-100">
          <div className="relative group p-6 md:p-10 rounded-[2.5rem] bg-white dark:bg-zinc-900/40 backdrop-blur-3xl border border-black/5 dark:border-white/5 shadow-2xl overflow-hidden transition-all duration-700">
            {/* Ambient Background */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-slate-100 dark:bg-slate-800 rounded-full blur-[80px] opacity-0 group-hover:opacity-40 transition-opacity duration-1000" />

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
              <div>
                <h2 className="text-xl font-bold text-black dark:text-white tracking-tight">
                    Engine Output
                </h2>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold italic">Seek in Real-Time</p>
              </div>
              
              <div className="sm:ml-auto">
                <button 
                  onClick={copyToClipboard}
                  className="w-full sm:w-auto px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-black dark:hover:text-white flex items-center justify-center gap-2 transition-colors border border-black/5 dark:border-white/5 rounded-full"
                >
                  {copied ? 'Copied' : 'Extract Content'}
                </button>
              </div>
            </div>

            <div className="prose prose-zinc dark:prose-invert max-w-none">
              {aiLoading ? (
                <AnswerSkeleton />
              ) : aiError ? (
                <div className="p-6 bg-red-50/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-800/50 rounded-2xl text-red-600 dark:text-red-400 text-sm">
                  {aiError}
                </div>
              ) : aiAnswer ? (
                <div className="text-base md:text-xl text-zinc-800 dark:text-zinc-200 leading-relaxed font-serif">
                   <TypewriterText text={aiAnswer} speed={12} />
                </div>
              ) : (
                <div className="text-zinc-400 italic">Iterating consensus...</div>
              )}
            </div>

            {/* Follow-up Console */}
            <AnimatePresence>
              {!aiLoading && aiAnswer && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-10 pt-8 border-t border-black/5 dark:border-white/5"
                >
                  <div className="relative">
                    <input 
                      type="text"
                      value={followUpQuery}
                      onChange={(e) => setFollowUpQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleFollowUp()}
                      placeholder="Ask a clarifying follow-up..."
                      className="w-full bg-black/5 dark:bg-white/5 border-none rounded-2xl py-4 pl-6 pr-32 text-sm focus:ring-2 ring-black/10 dark:ring-white/10 transition-all outline-none"
                    />
                    <button 
                      onClick={handleFollowUp}
                      disabled={!followUpQuery.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-4 sm:px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black text-[9px] sm:text-[11px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-xl active:scale-95 disabled:opacity-30"
                    >
                      Transmit
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Global Web Index */}
        <section className="animate-fade-in-up animate-delay-200 pb-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 border-b border-black/5 dark:border-white/5 pb-4 gap-4">
             <div className="flex items-center gap-3">
               <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-500">
                Verified Global Index
              </h2>
             </div>
             <div className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
               {results.length} Nodes Resolved
             </div>
          </div>
          
          {resultsLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <ResultCardSkeleton key={i} />
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:gap-8">
              {results.map((result, index) => (
                <motion.div
                  key={result.link}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <ResultCard result={result} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 opacity-40 italic">
               No index mapping available for this context.
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
