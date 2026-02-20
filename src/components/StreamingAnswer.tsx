/**
 * StreamingAnswer Component
 * 
 * Modern AI answer streaming with gradient processing indicators,
 * clean badges, and refined markdown rendering.
 */

'use client'

import { useEffect, useRef, useState, CSSProperties } from 'react'
import { useStreamingAnswer, StreamState } from '../hooks/useStreamingAnswer'

interface StreamingAnswerProps {
  query: string
  autoStart?: boolean
  className?: string
  style?: CSSProperties
  onComplete?: (answer: string) => void
  onRegenerate?: () => void
}

const STEPS = [
  "Analyzing query intent...",
  "Searching knowledge index...",
  "Synthesizing grounded answer...",
  "Verifying source citations..."
]

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
               <span className="w-1.5 h-1.5 rounded-full bg-primary animate-dot-pulse-1" />
               <span className="w-1.5 h-1.5 rounded-full bg-primary animate-dot-pulse-2" />
               <span className="w-1.5 h-1.5 rounded-full bg-primary animate-dot-pulse-3" />
             </div>
           ) : (
             <svg className="w-4 h-4 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
               <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
             </svg>
           )}
           <span className={`text-sm font-medium ${i === step ? 'text-foreground' : 'text-muted-foreground/40'}`}>{text}</span>
        </div>
      ))}
    </div>
  )
}

function StreamingCursor() {
  return (
    <span className="inline-block w-2 h-4 ml-0.5 animate-pulse rounded-sm align-middle bg-primary" />
  )
}

function getTierStyles(tier: string) {
  switch (tier) {
    case 'fast':
      return { className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' }
    case 'balanced':
      return { className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' }
    case 'heavy':
      return { className: 'bg-violet-500/10 text-violet-500 border-violet-500/20' }
    case 'code':
      return { className: 'bg-amber-500/10 text-amber-500 border-amber-500/20' }
    default:
      return { className: 'bg-muted text-muted-foreground border-border' }
  }
}

function getTierIcon(tier: string) {
  switch (tier) {
    case 'fast': return ''
    case 'balanced': return ''
    case 'heavy': return ''
    case 'code': return ''
    default: return ''
  }
}

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
  const tierStyle = getTierStyles(tier)
  
  return (
    <div className="flex items-center gap-2 mt-5 pt-4 flex-wrap border-t border-border/30">
      {cached && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          cached
        </span>
      )}
      
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border ${tierStyle.className}`}>
        <span>{getTierIcon(tier)}</span> {tier}
      </span>
      
      <span className="text-[11px] text-muted-foreground">
        {cached ? 'via' : 'by'}{' '}
        <span className="font-medium text-foreground/70">{modelHuman}</span>
      </span>
      
      <span className="text-[11px] text-muted-foreground/50">
        {cached ? 'instant' : `${latencyMs}ms`}
        {!cached && attempts > 1 && `  ${attempts} attempts`}
      </span>
    </div>
  )
}

export function StreamingAnswer({ 
  query, 
  autoStart = true, 
  className = '',
  style,
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

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onScroll = () => {
      shouldAutoScroll.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40
    }
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (autoStart && query && lastStartedQuery.current !== query) {
      lastStartedQuery.current = query
      completed.current = false
      startStream(query)
    }
  }, [query, autoStart, startStream])

  useEffect(() => {
    if (state === 'done' && onComplete && answer && !completed.current) {
      completed.current = true
      onComplete(answer)
    }
  }, [state, answer, onComplete])

  useEffect(() => {
    if (state === 'streaming' && containerRef.current && shouldAutoScroll.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [answer, state])

  const renderContent = () => {
    switch (state) {
      case 'idle':
      case 'thinking':
        return <ProcessingSteps />
        
      case 'streaming':
        return (
          <div className="w-full max-w-none">
            <div 
              className="prose prose-zinc dark:prose-invert max-w-none text-[17px] leading-7 font-[inherit]"
              dangerouslySetInnerHTML={{ 
                __html: formatMarkdown(answer) + '<span class="inline-block w-2 h-4 ml-0.5 animate-pulse rounded-sm align-middle bg-primary"></span>'
              }}
            />
          </div>
        )
        
      case 'done':
        return (
          <div className="w-full">
            <div 
              className="prose prose-zinc dark:prose-invert max-w-none text-[17px] leading-7 font-[inherit]"
              dangerouslySetInnerHTML={{ 
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
                className="mt-5 pt-4 flex items-center gap-2 text-xs font-medium transition-all text-muted-foreground hover:text-primary group/regen"
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
          <div className="flex items-center gap-2 text-destructive">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <span className="text-sm">{error || 'An error occurred'}</span>
            <button 
              onClick={() => {
                completed.current = false
                startStream(query)
              }}
              className="ml-2 px-3 py-1 text-xs rounded-lg transition-colors bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive/20"
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
      style={style}
    >
      {renderContent()}
    </div>
  )
}

function escapeHTML(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function formatMarkdown(text: string): string {
  let formatted = escapeHTML(text)

  const codeBlocks: string[] = []
  formatted = formatted.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    const placeholder = `\x00CODEBLOCK_${codeBlocks.length}\x00`
    const codeId = `codeblock-${codeBlocks.length}`
    codeBlocks.push(
      `<div class="my-6 rounded-xl overflow-hidden border border-border/50 shadow-lg bg-card"><div class="px-4 py-2 border-b border-border/30 text-[11px] font-mono flex justify-between items-center uppercase tracking-wider text-muted-foreground"><span>${lang || 'CODE'}</span><button onclick="(function(){var c=document.getElementById('${codeId}');navigator.clipboard.writeText(c.textContent);var b=event.target;b.textContent='Copied!';setTimeout(function(){b.textContent='Copy'},1500)})()" class="text-[10px] hover:text-primary transition-colors cursor-pointer normal-case tracking-normal">Copy</button></div><div class="p-4 overflow-x-auto"><pre><code id="${codeId}" class="font-mono text-sm leading-relaxed text-foreground/80">${code.trim()}</code></pre></div></div>`
    )
    return placeholder
  })

  const inlineCodes: string[] = []
  formatted = formatted.replace(/`([^`]+)`/g, (_, code) => {
    const placeholder = `\x00INLINECODE_${inlineCodes.length}\x00`
    inlineCodes.push(
      `<code class="px-1.5 py-0.5 rounded-md font-mono text-[13px] border border-foreground/10 bg-foreground/[0.03] text-foreground/80">${code}</code>`
    )
    return placeholder
  })

  formatted = formatted.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-semibold mt-8 mb-4 tracking-tight text-foreground" style="font-family:var(--font-display)">$1</h1>')
  formatted = formatted.replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-8 mb-3 tracking-tight text-foreground" style="font-family:var(--font-display)">$1</h2>')
  formatted = formatted.replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium mt-6 mb-3 text-foreground/90" style="font-family:var(--font-display)">$1</h3>')

  formatted = formatted.replace(/^\s*[-*]\s+(.*)$/gm, '<div class="flex items-start gap-3 mb-3 ml-1 group"><span class="mt-2 w-1.5 h-1.5 rounded-full shrink-0 bg-foreground/25"></span><span class="text-[17px] leading-relaxed text-foreground/85">$1</span></div>')
  
  formatted = formatted.replace(/^\s*(\d+)\.\s+(.*)$/gm, '<div class="flex items-start gap-3 mb-3 ml-1"><span class="text-sm font-mono mt-1 select-none text-foreground/30">$1.</span><span class="text-[17px] leading-relaxed text-foreground/85">$2</span></div>')

  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
  formatted = formatted.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em class="italic text-muted-foreground">$1</em>')

  formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) => {
    const trimmedUrl = url.trim()
    if (/^(https?:\/\/|\/)/.test(trimmedUrl)) {
      return `<a href="${trimmedUrl}" target="_blank" rel="noopener noreferrer" class="underline transition-colors text-foreground hover:text-foreground/60 decoration-foreground/20">${text}</a>`
    }
    return `${text} (${trimmedUrl})`
  })

  formatted = formatted.replace(/(?<!\="|&gt;\")(\ [(\d+)\])(?![^<]*<\/a>)/g, '<sup data-citation="$2" onclick="(function(){var el=document.querySelector(\x27[data-result-index=\"\x27+$2+\x27\"]\x27);if(el){el.scrollIntoView({behavior:\x27smooth\x27,block:\x27center\x27});el.classList.add(\x27ring-2\x27,\x27ring-foreground/30\x27);setTimeout(function(){el.classList.remove(\x27ring-2\x27,\x27ring-foreground/30\x27)},2000)}})()" class="ml-0.5 text-[10px] font-bold font-mono px-1.5 py-0.5 rounded cursor-pointer transition-colors select-none text-foreground/60 bg-foreground/[0.04]">[$2]</sup>')

  formatted = formatted.replace(/\n\n/g, '<div class="h-6"></div>')
  formatted = formatted.replace(/([^\n])\n([^\n])/g, '$1<br class="md:hidden" /> $2') 

  inlineCodes.forEach((html, i) => {
    formatted = formatted.replace(`\x00INLINECODE_${i}\x00`, html)
  })
  codeBlocks.forEach((html, i) => {
    formatted = formatted.replace(`\x00CODEBLOCK_${i}\x00`, html)
  })

  return formatted
}

export { formatMarkdown }
export type { StreamState }
