'use client'

import { useState, useEffect, useCallback } from 'react'
import { useDebounce } from './useDebounce'
import { useRouter } from 'next/navigation'

export interface SearchState {
  query: string
  suggestions: string[]
  prediction: string
  isLoading: boolean
  isTyping: boolean
}

export function useSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [prediction, setPrediction] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const debouncedQuery = useDebounce(query, 300)

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSuggestions([])
      setPrediction('')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/ai/suggest?q=${encodeURIComponent(q)}`)
      if (!response.ok) throw new Error('Failed to fetch suggestions')
      const data = await response.json()
      
      const newSuggestions = data.suggestions || []
      setSuggestions(newSuggestions)
      
      if (newSuggestions && newSuggestions.length > 0) {
        const matchingSuggestion = newSuggestions.find((s: any) => 
          typeof s === 'string' && s.toLowerCase().startsWith(q.toLowerCase())
        )
        if (matchingSuggestion) {
          setPrediction(matchingSuggestion)
        } else {
          setPrediction('')
        }
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error)
      setSuggestions([])
      setPrediction('')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSuggestions(debouncedQuery)
  }, [debouncedQuery, fetchSuggestions])

  const handleSearch = useCallback((searchQuery: string) => {
    if (searchQuery.trim()) {
      router.push(`/results?q=${encodeURIComponent(searchQuery)}`)
    }
  }, [router])

  const updateQuery = useCallback((newQuery: string) => {
    // Check for slash commands
    if (newQuery === '/about') {
      router.push('/about')
      return
    }
    if (newQuery === '/light') {
       // Logic for light mode could go here or via dispatch
    }

    setQuery(newQuery)
    setIsTyping(newQuery.length > 0)
  }, [router])

  return {
    query,
    suggestions,
    prediction,
    isLoading,
    isTyping,
    updateQuery,
    handleSearch,
    setSuggestions,
    setPrediction
  }
}
