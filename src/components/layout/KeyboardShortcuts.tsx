'use client'

/**
 * KeyboardShortcuts — toggled by "?" anywhere outside inputs.
 * Renders ONLY while open, so the overlay can never block the page
 * when it isn't supposed to be visible.
 */

import { useCallback, useEffect, useState } from 'react'

const SHORTCUT_GROUPS = [
  {
    label: 'Navigation',
    items: [
      { keys: ['/'], description: 'Focus search' },
      { keys: ['Esc'], description: 'Close / blur' },
      { keys: ['?'], description: 'Toggle this overlay' },
    ],
  },
  {
    label: 'Search',
    items: [
      { keys: ['Tab'], description: 'Accept ghost text' },
      { keys: ['↑', '↓'], description: 'Navigate suggestions' },
      { keys: ['Enter'], description: 'Search' },
    ],
  },
]

export default function KeyboardShortcuts() {
  const [open, setOpen] = useState(false)

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        return
      }

      if (
        e.key === '?' &&
        !e.ctrlKey &&
        !e.metaKey &&
        !(document.activeElement as HTMLElement | null)?.matches?.('input, textarea, select, [contenteditable="true"]')
      ) {
        e.preventDefault()
        setOpen((value) => !value)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // Nothing renders unless explicitly opened — no UA-dialog pitfalls
  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="keyboard-shortcuts-title"
      className="fixed inset-0 z-[200] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm"
      onClick={close}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h8M6 16h.01M10 16h4" />
            </svg>
            <h3 id="keyboard-shortcuts-title" className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Keyboard shortcuts</h3>
          </div>
          <button
            autoFocus
            onClick={close}
            aria-label="Close keyboard shortcuts"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-6 pb-5 space-y-4">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">{group.label}</p>
              <div className="space-y-2">
                {group.items.map((shortcut) => (
                  <div key={shortcut.description} className="flex items-center justify-between py-1">
                    <span className="text-sm text-zinc-600 dark:text-zinc-300">{shortcut.description}</span>
                    <div className="flex gap-1">
                      {shortcut.keys.map((key) => (
                        <kbd
                          key={key}
                          className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 text-[11px] font-mono font-medium bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-lg shadow-[0_1px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_0_rgba(255,255,255,0.05)]"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
          <p className="text-[11px] text-zinc-400 text-center">
            Press <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-zinc-800 rounded">?</kbd> anywhere to toggle
          </p>
        </div>
      </div>
    </div>
  )
}
