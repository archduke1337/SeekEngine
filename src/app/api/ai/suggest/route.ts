/**
 * API Route: /api/ai/suggest
 * Returns AI-powered search suggestions with semantic caching
 */

import { getSearchSuggestions } from '../../../../lib/openrouter'
import { validateSearchQuery } from '../../../../lib/validation'
import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory cache for suggestions (shorter TTL)
const suggestionsCache = new Map<string, {
  suggestions: string[]
  model: string
  modelHuman: string
  cachedAt: number
}>()

const SUGGESTIONS_CACHE_TTL = 1000 * 60 * 10 // 10 minutes

function normalizeForCache(query: string): string {
  return query.toLowerCase().trim().replace(/\s+/g, ' ')
}

// Enable edge runtime for faster cold starts
export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  // Validate query
  const validation = validateSearchQuery(searchParams)
  if (!validation.valid) {
    return NextResponse.json(
      { error: validation.error },
      { status: 400 }
    )
  }

  const query = validation.query!
  console.log(`💡 [SUGGEST] Query: "${query}"`)
  const cacheKey = normalizeForCache(query)

  try {
    // Check cache first
    const cached = suggestionsCache.get(cacheKey)
    if (cached && Date.now() - cached.cachedAt < SUGGESTIONS_CACHE_TTL) {
      console.log(`📦 Suggestions cache HIT for: "${query.slice(0, 30)}..."`)
      return NextResponse.json(
        {
          suggestions: cached.suggestions,
          model: cached.model,
          modelHuman: cached.modelHuman,
          latencyMs: 0,
          attempts: 0,
          cached: true,
        },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
            'X-Cache': 'HIT',
          },
        }
      )
    }

    // Cache miss - generate new suggestions
    const result = await getSearchSuggestions(query)
    
    // Cache the result
    if (result.suggestions.length > 0 && result.model !== 'fallback') {
      suggestionsCache.set(cacheKey, {
        suggestions: result.suggestions,
        model: result.model,
        modelHuman: result.modelHuman,
        cachedAt: Date.now(),
      })
      
      // LRU cleanup if cache gets too large
      if (suggestionsCache.size > 200) {
        const firstKey = suggestionsCache.keys().next().value
        if (firstKey) suggestionsCache.delete(firstKey)
      }
    }
    
    return NextResponse.json(
      {
        suggestions: result.suggestions,
        model: result.model,
        modelHuman: result.modelHuman,
        latencyMs: result.latencyMs,
        attempts: result.attempts,
        cached: false,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
          'X-Cache': 'MISS',
        },
      }
    )
  } catch (error) {
    console.error('Error in /api/ai/suggest:', error)
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    )
  }
}
