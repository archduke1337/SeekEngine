'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import ResultCard from '../../components/ResultCard'
import SearchBar from '../../components/SearchBar'
import { AnswerSkeleton, ResultCardSkeleton } from '../../components/Skeleton'
import { SearchResult } from '../../lib/google-search'
import TypewriterText from '../../components/TypewriterText'
import { motion } from 'framer-motion'

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
        <div className="mb-12 animate-fade-in-up flex items-end justify-between border-b border-black/5 dark:border-white/5 pb-8">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-[0.4em] font-black text-slate-400">Synthesis Engine Output</p>
            <h1 className="text-4xl sm:text-5xl font-black text-black dark:text-white tracking-tighter">
              {query}
            </h1>
          </div>
          <button 
            onClick={shareResults}
            className="group flex items-center gap-3 px-6 py-3 rounded-full bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border border-black/5 dark:border-white/5 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-black dark:hover:text-white transition-all active:scale-95 shadow-sm"
          >
            Share Insight
          </button>
        </div>

        {/* AI Answer - SwiftUI Glass Architecture */}
        <section className="mb-16 animate-fade-in-up animate-delay-100">
          <div className="p-10 rounded-[3rem] bg-white/40 dark:bg-zinc-900/40 backdrop-blur-[40px] border border-white dark:border-zinc-800 shadow-2xl relative overflow-hidden group">
            {/* Ambient Background Glow for Card */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-slate-100 dark:bg-slate-800 rounded-full blur-[80px] opacity-0 group-hover:opacity-40 transition-opacity duration-1000" />

            <div className="flex items-center gap-4 mb-8">
              <div>
                <h2 className="text-xl font-bold text-black dark:text-white tracking-tight">
                    Engine Output
                </h2>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold italic">Synthesized in Real-Time</p>
              </div>
              
              <div className="ml-auto">
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-black dark:hover:text-white flex items-center gap-2 transition-colors border border-black/5 dark:border-white/5 rounded-full"
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
                <div className="text-lg lg:text-xl text-zinc-800 dark:text-zinc-200 leading-relaxed font-serif">
                   <TypewriterText text={aiAnswer} speed={12} />
                </div>
              ) : (
                <p className="text-zinc-500 dark:text-zinc-400 italic">No intelligence synthesis available for this query.</p>
              )}
            </div>

            {/* Premium Follow-up Console */}
            {aiAnswer && (
              <div className="mt-12 pt-10 border-t border-black/5 dark:border-white/5">
                <div className="relative group/input">
                  <input
                    type="text"
                    value={followUpQuery}
                    onChange={(e) => setFollowUpQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleFollowUp()
                    }}
                    placeholder="Deepen the inquiry..."
                    className="w-full px-8 py-5 text-base border-none ring-1 ring-black/5 dark:ring-white/5 rounded-[2rem] bg-white/50 dark:bg-zinc-800/50 text-black dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all duration-500 shadow-inner group-focus-within/input:shadow-2xl"
                  />
                  <button
                    onClick={handleFollowUp}
                    disabled={!followUpQuery.trim()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black text-[11px] font-black uppercase tracking-widest rounded-full hover:scale-105 transition-all shadow-xl active:scale-95 disabled:opacity-30 flex items-center gap-2"
                  >
                    Transmit
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Distributed Web Index */}
        <section className="animate-fade-in-up animate-delay-200 pb-20">
          <div className="flex items-center justify-between mb-8 border-b border-black/5 dark:border-white/5 pb-4">
             <div className="flex items-center gap-3">
               <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-500">
                Verified Global Index
              </h2>
             </div>
            <span className="text-[10px] font-bold text-slate-400 bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full uppercase tracking-widest">
              {results.length} Nodes Found
            </span>
          </div>

          {resultsLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <ResultCardSkeleton key={i} />
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-4">
              {results.map((result, index) => (
                <ResultCard key={index} result={result} />
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
