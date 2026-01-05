/**
 * TypewriterText - Animated Typewriter Effect
 * Displays text with a smooth typewriter animation
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface TypewriterTextProps {
  text: string
  speed?: number
  className?: string
}

export default function TypewriterText({ text, speed = 20, className = '' }: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const versionRef = useRef(0)

  // Reset and versioning to prevent races
  useEffect(() => {
    versionRef.current += 1
    setDisplayedText('')
    setCurrentIndex(0)
    setIsComplete(false)
  }, [text])

  useEffect(() => {
    // Explicit guard for empty text
    if (!text) {
      setIsComplete(true)
      return
    }

    const currentVersion = versionRef.current

    if (currentIndex < text.length) {
      // Efficiency: Batch characters per tick to reduce React re-renders on long strings
      // Target ~50ms per tick for smooth perceived animation
      const charsPerTick = Math.max(1, Math.floor(50 / speed))
      
      const timeout = setTimeout(() => {
        // Race condition check: ensure we are still on the same text version
        if (versionRef.current !== currentVersion) return

        const nextIndex = Math.min(currentIndex + charsPerTick, text.length)
        setDisplayedText(text.slice(0, nextIndex))
        setCurrentIndex(nextIndex)
      }, speed)

      return () => clearTimeout(timeout)
    } else {
      setIsComplete(true)
    }
  }, [currentIndex, text, speed])

  return (
    <div className={className}>
      <article 
        className="prose prose-zinc dark:prose-invert max-w-none
          prose-headings:font-semibold prose-headings:text-black dark:prose-headings:text-white
          prose-h1:text-xl prose-h2:text-lg prose-h3:text-base
          prose-p:text-zinc-600 dark:prose-p:text-zinc-300 prose-p:leading-relaxed
          prose-a:text-black dark:prose-a:text-white prose-a:underline hover:prose-a:no-underline
          prose-strong:text-black dark:prose-strong:text-white prose-strong:font-semibold
          prose-code:text-sm prose-code:bg-zinc-100 dark:prose-code:bg-zinc-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
          prose-pre:bg-zinc-900 dark:prose-pre:bg-zinc-950 prose-pre:rounded-xl prose-pre:border prose-pre:border-zinc-800
          prose-ul:text-zinc-600 dark:prose-ul:text-zinc-300
          prose-ol:text-zinc-600 dark:prose-ol:text-zinc-300
          prose-li:marker:text-zinc-400
          prose-blockquote:border-l-zinc-300 dark:prose-blockquote:border-l-zinc-700 prose-blockquote:text-zinc-500
          prose-table:text-sm
          prose-th:bg-zinc-100 dark:prose-th:bg-zinc-800 prose-th:px-3 prose-th:py-2
          prose-td:px-3 prose-td:py-2 prose-td:border-zinc-200 dark:prose-td:border-zinc-700
        "
        aria-live="polite"
        aria-busy={!isComplete}
      >
        {/* 
          Aesthetic Strategy A: Type plain text source during animation 
          to prevent markdown parser jitter. Snap to full markdown rendering 
          only upon completion for layout stability.
        */}
        {isComplete ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {text}
          </ReactMarkdown>
        ) : (
          <span className="whitespace-pre-wrap font-sans text-zinc-600 dark:text-zinc-300">
            {displayedText}
          </span>
        )}
      </article>
      
      {/* 
        Cursor Polish: Avoid cursor jumping to new lines on trailing newlines
      */}
      {!isComplete && !displayedText.endsWith('\n') && (
        <span className="inline-block w-0.5 h-4 bg-black dark:bg-white ml-0.5 animate-pulse align-middle" />
      )}
    </div>
  )
}
