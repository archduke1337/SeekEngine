/**
 * useStreamingAnswer Hook
 * 
 * Consumes the /api/ai/stream SSE endpoint and provides:
 * - Real-time token streaming
 * - State management (thinking, streaming, done, error)
 * - Model metadata when complete
 * 
 * Usage:
 * const { answer, state, model, startStream, reset } = useStreamingAnswer()
 * startStream('What is quantum computing?')
 */

'use client'

import { useState, useCallback, useRef } from 'react'

export type StreamState = 'idle' | 'thinking' | 'streaming' | 'done' | 'error'

export interface StreamMetadata {
  model: string
  modelHuman: string
  tier: string
  latencyMs: number
  attempts: number
}

interface StreamEvent {
  type: 'token' | 'thinking' | 'done' | 'error' | 'model_selected'
  content?: string
  model?: string
  modelHuman?: string
  tier?: string
  latencyMs?: number
  attempts?: number
  error?: string
}

export function useStreamingAnswer() {
  const [answer, setAnswer] = useState('')
  const [state, setState] = useState<StreamState>('idle')
  const [metadata, setMetadata] = useState<StreamMetadata | null>(null)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const reset = useCallback(() => {
    setAnswer('')
    setState('idle')
    setMetadata(null)
    setError(null)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  const startStream = useCallback(async (query: string) => {
    // Reset previous state
    reset()
    setState('thinking')

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch(
        `/api/ai/stream?q=${encodeURIComponent(query)}`,
        { signal: abortControllerRef.current.signal }
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      if (!response.body) {
        throw new Error('No response body')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue

          try {
            const event: StreamEvent = JSON.parse(line.slice(6))

            switch (event.type) {
              case 'thinking':
                setState('thinking')
                break

              case 'model_selected':
                // Model was selected, streaming will start soon
                setMetadata({
                  model: event.model || '',
                  modelHuman: event.modelHuman || '',
                  tier: event.tier || 'balanced',
                  latencyMs: 0,
                  attempts: event.attempts || 1,
                })
                break

              case 'token':
                setState('streaming')
                setAnswer(prev => prev + (event.content || ''))
                break

              case 'done':
                setState('done')
                setMetadata({
                  model: event.model || '',
                  modelHuman: event.modelHuman || '',
                  tier: event.tier || 'balanced',
                  latencyMs: event.latencyMs || 0,
                  attempts: event.attempts || 1,
                })
                break

              case 'error':
                setState('error')
                setError(event.error || 'Unknown error')
                break
            }
          } catch {
            // Ignore parse errors
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        // User cancelled, don't treat as error
        setState('idle')
      } else {
        setState('error')
        setError((err as Error).message)
      }
    }
  }, [reset])

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    if (state === 'streaming' || state === 'thinking') {
      setState('done')
    }
  }, [state])

  return {
    answer,
    state,
    metadata,
    error,
    startStream,
    stop,
    reset,
    isLoading: state === 'thinking' || state === 'streaming',
  }
}
