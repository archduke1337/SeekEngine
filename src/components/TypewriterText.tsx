/**
 * TypewriterText - Animated Typewriter Effect
 * Displays text with a smooth typewriter animation
 */

'use client'

import { useState, useEffect } from 'react'
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

  useEffect(() => {
    if (text && currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, speed)

      return () => clearTimeout(timeout)
    } else {
      setIsComplete(true)
    }
  }, [currentIndex, text, speed])

  // Reset when text changes
  useEffect(() => {
    setDisplayedText('')
    setCurrentIndex(0)
    setIsComplete(false)
  }, [text])

  return (
    <div className={className}>
      <article className="prose prose-zinc dark:prose-invert max-w-none
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
      ">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {displayedText}
        </ReactMarkdown>
      </article>
      {!isComplete && (
        <span className="inline-block w-0.5 h-4 bg-black dark:bg-white ml-0.5 animate-pulse" />
      )}
    </div>
  )
}
