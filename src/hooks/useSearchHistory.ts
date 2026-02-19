'use client'

import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'seekengine-search-history'
const MAX_HISTORY = 20

export interface SearchHistoryEntry {
  query: string
  timestamp: number
}

export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryEntry[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as SearchHistoryEntry[]
        setHistory(parsed)
      }
    } catch {
      // localStorage may be unavailable
    }
  }, [])

  const addEntry = useCallback((query: string) => {
    const trimmed = query.trim()
    if (!trimmed) return

    setHistory(prev => {
      // Remove duplicate if exists
      const filtered = prev.filter(
        e => e.query.toLowerCase() !== trimmed.toLowerCase()
      )
      // Prepend new entry
      const updated = [
        { query: trimmed, timestamp: Date.now() },
        ...filtered,
      ].slice(0, MAX_HISTORY)

      // Persist
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch { /* quota exceeded or unavailable */ }

      return updated
    })
  }, [])

  const removeEntry = useCallback((query: string) => {
    setHistory(prev => {
      const updated = prev.filter(
        e => e.query.toLowerCase() !== query.toLowerCase()
      )
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch { /* ignore */ }
      return updated
    })
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch { /* ignore */ }
  }, [])

  return { history, addEntry, removeEntry, clearHistory }
}
