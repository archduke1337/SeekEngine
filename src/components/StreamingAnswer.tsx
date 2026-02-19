/**
 * StreamingAnswer Component
 * 
 * Displays AI answers with real-time token streaming, thinking states,
 * and beautiful progressive rendering with model attribution badge.
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import { useStreamingAnswer, StreamState } from '../hooks/useStreamingAnswer'

interface StreamingAnswerProps {
  query: string
  autoStart?: boolean
  className?: string
  onComplete?: (answer: string) => void
  onRegenerate?: () => void
}

const STEPS = [
  "Analyzing query intent...",
  "Searching knowledge index...",
  "Synthesizing grounded answer...",
  "Verifying source citations..."
]

// Processing Console Animation
function ProcessingSteps() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(s => (s < STEPS.length - 1 ? s + 1 : s))
    }, 900)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col gap-3 py-2">
      {STEPS.map((text, i) => (
        <div key={i} className={`flex items-center gap-3 transition-all duration-500 ${i > step ? 'opacity-0 translate-y-1' : i === step ? 'opacity-100' : 'opacity-30'}`}>
           {i === step ? (
             <div className="flex items-center gap-1">
               <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-dot-pulse-1" />
               <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-dot-pulse-2" />
               <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-dot-pulse-3" />
             </div>
           ) : (
             <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
               <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
             </svg>
           )}
           <span className={`text-sm font-medium ${i === step ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-400 dark:text-zinc-600'}`}>{text}</span>
        </div>
      ))}
    </div>
  )
}

// Streaming cursor
function StreamingCursor() {
  return (
    <span className="inline-block w-2 h-4 ml-0.5 bg-blue-500 dark:bg-blue-400 animate-pulse rounded-sm align-middle" />
  )
}

// Tier badge colors
function getTierStyles(tier: string) {
  switch (tier) {
    case 'fast':
      return 'bg-emerald-50 text-emerald-600 border-emerald-200/50 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-700/30'
    case 'balanced':
      return 'bg-blue-50 text-blue-600 border-blue-200/50 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700/30'
    case 'heavy':
      return 'bg-purple-50 text-purple-600 border-purple-200/50 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-700/30'
    case 'code':
      return 'bg-amber-50 text-amber-600 border-amber-200/50 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700/30'
    default:
      return 'bg-zinc-50 text-zinc-600 border-zinc-200/50 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700/30'
  }
}

// Tier emoji
function getTierEmoji(tier: string) {
  switch (tier) {
    case 'fast': return '⚡'
    case 'balanced': return '🧠'
    case 'heavy': return '🔬'
    case 'code': return '💻'
    default: return '✨'
  }
}

// Model attribution badge
function ModelBadge({ 
  modelHuman, 
  tier, 
  latencyMs, 
  attempts,
  cached = false
}: { 
  modelHuman: string
  tier: string
  latencyMs: number
  attempts: number
  cached?: boolean
}) {
  return (
    <div className="flex items-center gap-2 mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex-wrap">
      {/* Cache badge */}
      {cached && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-200/50 dark:border-amber-700/30">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Cached
        </span>
      )}
      
      {/* Tier badge */}
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border ${getTierStyles(tier)}`}>
        {getTierEmoji(tier)} {tier.charAt(0).toUpperCase() + tier.slice(1)}
      </span>
      
      {/* Model info */}
      <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
        {cached ? 'via' : 'by'}{' '}
        <span className="font-medium text-zinc-600 dark:text-zinc-400">{modelHuman}</span>
      </span>
      
      {/* Timing */}
      <span className="text-[11px] text-zinc-300 dark:text-zinc-600">
        {cached ? 'instant' : `${latencyMs}ms`}
        {!cached && attempts > 1 && ` · ${attempts} attempts`}
      </span>
    </div>
  )
}

export function StreamingAnswer({ 
  query, 
  autoStart = true, 
  className = '',
  onComplete,
  onRegenerate,
}: StreamingAnswerProps) {
  const { 
    answer, 
    state, 
    metadata, 
    error, 
    startStream, 
    reset,
    isLoading 
  } = useStreamingAnswer()
  
  const containerRef = useRef<HTMLDivElement>(null)
  const lastStartedQuery = useRef<string | null>(null)
  const completed = useRef(false)
  const shouldAutoScroll = useRef(true)

  // Standard Streaming UX: Only auto-scroll if user is near the bottom
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onScroll = () => {
      // Threshold of 40px from bottom to consider "at bottom"
      shouldAutoScroll.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40
    }

    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  // Consolidated Lifecycle Effect
  useEffect(() => {
    if (autoStart && query && lastStartedQuery.current !== query) {
      lastStartedQuery.current = query
      completed.current = false
      startStream(query)
    }
  }, [query, autoStart, startStream])

  // Lifecycle Callback Guard: Prevents double-fire if state re-paints
  useEffect(() => {
    if (state === 'done' && onComplete && answer && !completed.current) {
      completed.current = true
      onComplete(answer)
    }
  }, [state, answer, onComplete])

  // Intelligent Auto-scroll
  useEffect(() => {
    if (state === 'streaming' && containerRef.current && shouldAutoScroll.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [answer, state])

  const renderContent = () => {
    switch (state) {
      case 'idle':
        return <ProcessingSteps />
        
      case 'thinking':
        return <ProcessingSteps />
        
      case 'streaming':
        return (
          <div className="w-full max-w-none">
            <div 
              className="prose prose-zinc dark:prose-invert max-w-none text-[17px] leading-7"
              dangerouslySetInnerHTML={{ 
                __html: formatMarkdown(answer) + '<span class="inline-block w-2 h-4 ml-0.5 bg-blue-500 dark:bg-blue-400 animate-pulse rounded-sm align-middle"></span>'
              }}
            />
          </div>
        )
        
      case 'done':
        return (
          <div className="w-full">
            <div 
              className="prose prose-zinc dark:prose-invert max-w-none text-[17px] leading-7"
              dangerouslySetInnerHTML={{ 
                 // Ensure fallback text if string is empty
                 __html: formatMarkdown(answer) || '<p class="opacity-50 italic">No content generated.</p>' 
              }}
            />
            <div className="flex items-center justify-between flex-wrap gap-2">
              {metadata && (
                <ModelBadge 
                  modelHuman={metadata.modelHuman}
                  tier={metadata.tier}
                  latencyMs={metadata.latencyMs}
                  attempts={metadata.attempts}
                  cached={metadata.cached}
                />
              )}
              <button
                onClick={() => {
                  completed.current = false
                  lastStartedQuery.current = null
                  onRegenerate?.()
                  startStream(query)
                }}
                className="mt-5 pt-4 flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 font-medium transition-all group/regen"
                title="Regenerate answer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover/regen:rotate-180 transition-transform duration-500">
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                </svg>
                Regenerate
              </button>
            </div>
          </div>
        )
        
      case 'error':
        return (
          <div className="flex items-center gap-2 text-red-500 dark:text-red-400">
            <span>⚠️</span>
            <span className="text-sm">{error || 'An error occurred'}</span>
            <button 
              onClick={() => {
                completed.current = false
                startStream(query)
              }}
              className="ml-2 px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
            >
              Retry
            </button>
          </div>
        )
        
      default:
        return null
    }
  }

  return (
    <div 
      ref={containerRef}
      className={`relative ${className}`}
    >
      {renderContent()}
      
      {/* Loading bar removed as requested */}
    </div>
  )
}

function escapeHTML(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// Semantic Markdown Formatter
function formatMarkdown(text: string): string {
  let formatted = escapeHTML(text)

  // 1. Code Blocks — Extract and replace with placeholders to protect from subsequent regex
  const codeBlocks: string[] = []
  formatted = formatted.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    const placeholder = `\x00CODEBLOCK_${codeBlocks.length}\x00`
    const codeId = `codeblock-${codeBlocks.length}`
    codeBlocks.push(
      `<div class="my-6 rounded-xl overflow-hidden bg-[#0d0d0d] border border-white/10 shadow-lg"><div class="px-4 py-2 bg-white/5 border-b border-white/5 text-[11px] font-mono text-zinc-400 flex justify-between items-center uppercase tracking-wider"><span>${lang || 'CODE'}</span><button onclick="(function(){var c=document.getElementById('${codeId}');navigator.clipboard.writeText(c.textContent);var b=event.target;b.textContent='Copied!';setTimeout(function(){b.textContent='Copy'},1500)})()" class="text-[10px] text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer normal-case tracking-normal">Copy</button></div><div class="p-4 overflow-x-auto"><pre><code id="${codeId}" class="font-mono text-sm text-zinc-300 leading-relaxed">${code.trim()}</code></pre></div></div>`
    )
    return placeholder
  })

  // 1b. Inline code — Extract and replace with placeholders before other formatting
  const inlineCodes: string[] = []
  formatted = formatted.replace(/`([^`]+)`/g, (_, code) => {
    const placeholder = `\x00INLINECODE_${inlineCodes.length}\x00`
    inlineCodes.push(
      `<code class="px-1.5 py-0.5 bg-zinc-100 dark:bg-white/10 rounded-[6px] font-mono text-[13px] text-pink-600 dark:text-pink-400 border border-black/5 dark:border-white/5">${code}</code>`
    )
    return placeholder
  })

  // 2. Headers (Apple-style hierarchy)
  formatted = formatted.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-semibold mt-8 mb-4 text-zinc-900 dark:text-zinc-50 tracking-tight">$1</h1>')
  formatted = formatted.replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-8 mb-3 text-zinc-900 dark:text-zinc-100 tracking-tight">$1</h2>')
  formatted = formatted.replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium mt-6 mb-3 text-zinc-800 dark:text-zinc-200">$1</h3>')

  // 3. Lists BEFORE bold/italic to prevent `* item` being matched as italic
  // 3a. Lists (Unordered - Bullet points: both - and * prefixes)
  formatted = formatted.replace(/^\s*[-*]\s+(.*)$/gm, '<div class="flex items-start gap-3 mb-3 ml-1 group"><span class="mt-2 w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600 shrink-0 group-hover:bg-blue-500 transition-colors"></span><span class="text-[17px] leading-relaxed text-zinc-700 dark:text-zinc-300">$1</span></div>')
  
  // 3b. Lists (Ordered)
  formatted = formatted.replace(/^\s*(\d+)\.\s+(.*)$/gm, '<div class="flex items-start gap-3 mb-3 ml-1"><span class="text-sm font-mono text-zinc-400 dark:text-zinc-500 mt-1 select-none">$1.</span><span class="text-[17px] leading-relaxed text-zinc-700 dark:text-zinc-300">$2</span></div>')

  // 4. Bold & Italic (process bold FIRST, then italic with negative lookbehind to avoid double-processing)
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-zinc-900 dark:text-zinc-50">$1</strong>')
  formatted = formatted.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em class="italic text-zinc-600 dark:text-zinc-400">$1</em>')

  // 5. Links — [text](url) with XSS protection (only allow http/https)
  formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) => {
    // Block javascript:, data:, vbscript: and other dangerous protocols
    const trimmedUrl = url.trim()
    if (/^(https?:\/\/|\/)/.test(trimmedUrl)) {
      return `<a href="${trimmedUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 underline decoration-blue-300/40 dark:decoration-blue-500/40 hover:decoration-blue-500 dark:hover:decoration-blue-400 transition-colors">${text}</a>`
    }
    // Unsafe URL — render as plain text
    return `${text} (${trimmedUrl})`
  })

  // 6. Citations (Superscript interactive) — clickable, scrolls to corresponding result card
  formatted = formatted.replace(/(?<!=\"|&gt;\")\[(\d+)\](?![^<]*<\/a>)/g, '<sup data-citation="$1" onclick="(function(){var el=document.querySelector(\x27[data-result-index=\"\x27+$1+\x27\"]\x27);if(el){el.scrollIntoView({behavior:\x27smooth\x27,block:\x27center\x27});el.classList.add(\x27ring-2\x27,\x27ring-blue-500\x27);setTimeout(function(){el.classList.remove(\x27ring-2\x27,\x27ring-blue-500\x27)},2000)}})()" class="ml-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-1.5 py-0.5 rounded cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors select-none">[$1]</sup>')

  // 7. Paragraphs (Detect Double Newline)
  formatted = formatted.replace(/\n\n/g, '<div class="h-6"></div>')
  formatted = formatted.replace(/([^\n])\n([^\n])/g, '$1<br class="md:hidden" /> $2') 

  // 8. Restore protected code blocks and inline code
  inlineCodes.forEach((html, i) => {
    formatted = formatted.replace(`\x00INLINECODE_${i}\x00`, html)
  })
  codeBlocks.forEach((html, i) => {
    formatted = formatted.replace(`\x00CODEBLOCK_${i}\x00`, html)
  })

  return formatted
}

// Export for testing and external use
export { formatMarkdown }

// Export state type for external use
export type { StreamState }
