/**
 * StreamingAnswer Component
 * 
 * Retro-Futuristic AI answer streaming with terminal aesthetics,
 * neon processing indicators, and monospace model attribution.
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

// Processing Console Animation — Retro Terminal Style
function ProcessingSteps() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(s => (s < STEPS.length - 1 ? s + 1 : s))
    }, 900)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col gap-3 py-2 font-mono">
      {STEPS.map((text, i) => (
        <div key={i} className={`flex items-center gap-3 transition-all duration-500 ${i > step ? 'opacity-0 translate-y-1' : i === step ? 'opacity-100' : 'opacity-30'}`}>
           {i === step ? (
             <div className="flex items-center gap-1">
               <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-dot-pulse-1" />
               <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-dot-pulse-2" />
               <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-dot-pulse-3" />
             </div>
           ) : (
             <svg className="w-4 h-4 shrink-0" style={{ color: 'var(--accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
               <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
             </svg>
           )}
           <span className={`text-sm font-medium ${i === step ? 'text-[var(--foreground)]' : 'opacity-40'}`}>{text}</span>
        </div>
      ))}
    </div>
  )
}

// Streaming cursor — Neon accent
function StreamingCursor() {
  return (
    <span className="inline-block w-2 h-4 ml-0.5 animate-pulse rounded-sm align-middle" style={{ background: 'var(--accent)' }} />
  )
}

// Tier badge colors — Retro palette
function getTierStyles(tier: string) {
  switch (tier) {
    case 'fast':
      return { bg: 'rgba(0,255,240,0.08)', color: '#00fff0', border: 'rgba(0,255,240,0.15)' }
    case 'balanced':
      return { bg: 'rgba(0,144,255,0.08)', color: '#0090ff', border: 'rgba(0,144,255,0.15)' }
    case 'heavy':
      return { bg: 'rgba(180,0,255,0.08)', color: '#b400ff', border: 'rgba(180,0,255,0.15)' }
    case 'code':
      return { bg: 'rgba(255,200,0,0.08)', color: '#ffc800', border: 'rgba(255,200,0,0.15)' }
    default:
      return { bg: 'rgba(100,100,120,0.08)', color: '#6b6b80', border: 'rgba(100,100,120,0.15)' }
  }
}

// Tier symbol — Terminal style
function getTierSymbol(tier: string) {
  switch (tier) {
    case 'fast': return '>'
    case 'balanced': return '>>'
    case 'heavy': return '>>>'
    case 'code': return '</>'
    default: return '*'
  }
}

// Model attribution badge — Retro Terminal
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
    <div className="flex items-center gap-2 mt-5 pt-4 flex-wrap font-mono" style={{ borderTop: '1px solid var(--border)' }}>
      {/* Cache badge */}
      {cached && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium"
              style={{ background: 'rgba(255,200,0,0.08)', color: '#ffc800', border: '1px solid rgba(255,200,0,0.15)' }}>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          cached
        </span>
      )}
      
      {/* Tier badge */}
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium"
            style={{ background: tierStyle.bg, color: tierStyle.color, border: `1px solid ${tierStyle.border}` }}>
        <span className="opacity-60">{getTierSymbol(tier)}</span> {tier}
      </span>
      
      {/* Model info */}
      <span className="text-[11px]" style={{ color: 'var(--muted)' }}>
        {cached ? 'via' : 'by'}{' '}
        <span className="font-medium" style={{ color: 'var(--foreground)', opacity: 0.7 }}>{modelHuman}</span>
      </span>
      
      {/* Timing */}
      <span className="text-[11px]" style={{ color: 'var(--muted)', opacity: 0.5 }}>
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
              className="prose prose-zinc dark:prose-invert max-w-none text-[17px] leading-7 font-[inherit]"
              dangerouslySetInnerHTML={{ 
                __html: formatMarkdown(answer) + '<span class="inline-block w-2 h-4 ml-0.5 animate-pulse rounded-sm align-middle" style="background:var(--accent)"></span>'
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
                 __html: formatMarkdown(answer) || '<p class="opacity-50 italic font-mono">No content generated.</p>' 
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
                className="mt-5 pt-4 flex items-center gap-2 text-xs font-mono font-medium transition-all group/regen"
                style={{ color: 'var(--muted)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--accent)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--muted)' }}
                title="Regenerate answer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover/regen:rotate-180 transition-transform duration-500">
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                </svg>
                regenerate
              </button>
            </div>
          </div>
        )
        
      case 'error':
        return (
          <div className="flex items-center gap-2 font-mono" style={{ color: 'var(--accent-secondary, #ff006a)' }}>
            <span>!</span>
            <span className="text-sm">{error || 'An error occurred'}</span>
            <button 
              onClick={() => {
                completed.current = false
                startStream(query)
              }}
              className="ml-2 px-2 py-1 text-xs rounded transition-colors"
              style={{ background: 'rgba(255,0,106,0.1)', border: '1px solid rgba(255,0,106,0.2)' }}
            >
              retry
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
      `<div class="my-6 rounded-xl overflow-hidden border shadow-lg" style="background:#0a0a0f;border-color:rgba(0,255,240,0.08)"><div class="px-4 py-2 border-b text-[11px] font-mono flex justify-between items-center uppercase tracking-wider" style="background:rgba(0,255,240,0.03);border-color:rgba(0,255,240,0.06);color:var(--accent)"><span>${lang || 'CODE'}</span><button onclick="(function(){var c=document.getElementById('${codeId}');navigator.clipboard.writeText(c.textContent);var b=event.target;b.textContent='Copied!';setTimeout(function(){b.textContent='Copy'},1500)})()" class="text-[10px] hover:opacity-80 transition-colors cursor-pointer normal-case tracking-normal" style="color:var(--muted)">Copy</button></div><div class="p-4 overflow-x-auto"><pre><code id="${codeId}" class="font-mono text-sm leading-relaxed" style="color:#c0c0d0">${code.trim()}</code></pre></div></div>`
    )
    return placeholder
  })

  // 1b. Inline code — Extract and replace with placeholders before other formatting
  const inlineCodes: string[] = []
  formatted = formatted.replace(/`([^`]+)`/g, (_, code) => {
    const placeholder = `\x00INLINECODE_${inlineCodes.length}\x00`
    inlineCodes.push(
      `<code class="px-1.5 py-0.5 rounded-[6px] font-mono text-[13px] border" style="background:rgba(0,255,240,0.06);color:var(--accent);border-color:rgba(0,255,240,0.1)">${code}</code>`
    )
    return placeholder
  })

  // 2. Headers (Retro hierarchy)
  formatted = formatted.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-semibold mt-8 mb-4 tracking-tight font-display" style="color:var(--foreground)">$1</h1>')
  formatted = formatted.replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-8 mb-3 tracking-tight font-display" style="color:var(--foreground)">$1</h2>')
  formatted = formatted.replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium mt-6 mb-3" style="color:var(--foreground);opacity:0.9">$1</h3>')

  // 3. Lists BEFORE bold/italic to prevent `* item` being matched as italic
  // 3a. Lists (Unordered - Bullet points: both - and * prefixes)
  formatted = formatted.replace(/^\s*[-*]\s+(.*)$/gm, '<div class="flex items-start gap-3 mb-3 ml-1 group"><span class="mt-2 w-1.5 h-1.5 rounded-full shrink-0 transition-colors" style="background:var(--accent);opacity:0.4"></span><span class="text-[17px] leading-relaxed" style="color:var(--foreground);opacity:0.85">$1</span></div>')
  
  // 3b. Lists (Ordered)
  formatted = formatted.replace(/^\s*(\d+)\.\s+(.*)$/gm, '<div class="flex items-start gap-3 mb-3 ml-1"><span class="text-sm font-mono mt-1 select-none" style="color:var(--accent);opacity:0.5">$1.</span><span class="text-[17px] leading-relaxed" style="color:var(--foreground);opacity:0.85">$2</span></div>')

  // 4. Bold & Italic (process bold FIRST, then italic with negative lookbehind to avoid double-processing)
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold" style="color:var(--foreground)">$1</strong>')
  formatted = formatted.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em class="italic" style="color:var(--muted)">$1</em>')

  // 5. Links — [text](url) with XSS protection (only allow http/https)
  formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) => {
    // Block javascript:, data:, vbscript: and other dangerous protocols
    const trimmedUrl = url.trim()
    if (/^(https?:\/\/|\/)/.test(trimmedUrl)) {
      return `<a href="${trimmedUrl}" target="_blank" rel="noopener noreferrer" class="underline transition-colors" style="color:var(--accent);text-decoration-color:rgba(0,255,240,0.3)">${text}</a>`
    }
    // Unsafe URL — render as plain text
    return `${text} (${trimmedUrl})`
  })

  // 6. Citations (Superscript interactive) — clickable, scrolls to corresponding result card
  formatted = formatted.replace(/(?<!=\"|&gt;\")(\[(\d+)\])(?![^<]*<\/a>)/g, '<sup data-citation="$2" onclick="(function(){var el=document.querySelector(\x27[data-result-index=\"\x27+$2+\x27\"]\x27);if(el){el.scrollIntoView({behavior:\x27smooth\x27,block:\x27center\x27});el.classList.add(\x27ring-2\x27,\x27ring-[var(--accent)]\x27);setTimeout(function(){el.classList.remove(\x27ring-2\x27,\x27ring-[var(--accent)]\x27)},2000)}})()" class="ml-0.5 text-[10px] font-bold font-mono px-1.5 py-0.5 rounded cursor-pointer transition-colors select-none" style="color:var(--accent);background:rgba(0,255,240,0.06)">[$2]</sup>')

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
