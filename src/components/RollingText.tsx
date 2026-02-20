'use client'

/**
 * RollingText Component — Marquee Banner
 * Inspired by Skiper UI Text Roll Navigation (skiper58)
 * Infinite horizontal scrolling text with separator
 */

interface RollingTextProps {
  items: string[]
  separator?: string
  speed?: number
  className?: string
  itemClassName?: string
}

export default function RollingText({
  items,
  separator = '\u2014',
  speed = 35,
  className = '',
  itemClassName = '',
}: RollingTextProps) {
  // Duplicate items enough times for seamless loop
  const repeatedItems = [...items, ...items, ...items, ...items]

  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`} aria-hidden="true">
      <div
        className="marquee-track"
        style={{ animationDuration: `${speed}s` }}
      >
        {repeatedItems.map((item, i) => (
          <span key={i} className={`inline-flex items-center gap-4 px-4 ${itemClassName}`}>
            <span>{item}</span>
            <span className="opacity-30">{separator}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
