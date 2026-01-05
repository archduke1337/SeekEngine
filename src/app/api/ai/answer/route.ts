/**
 * API Route: /api/ai/answer
 * Returns AI-generated answer/summary with semantic caching
 * 
 * Cache Flow:
 * 1. Check semantic cache for similar query
 * 2. If HIT → return cached answer instantly (with cached: true)
 * 3. If MISS → generate new answer, cache it, return
 */

import { generateAIAnswer } from '../../../../lib/openrouter'
import { getSerpResults } from '../../../../lib/serpapi'
import { getWebSearchResults } from '../../../../lib/google-search'
import { validateSearchQuery } from '../../../../lib/validation'
import { 
  getCachedAnswer, 
  setCachedAnswer,
  type CachedAnswer 
} from '../../../../lib/semantic-cache'
import { NextRequest, NextResponse } from 'next/server'

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

  try {
    // 1. Check semantic cache first
    const cached = getCachedAnswer(query, 'answer')
    
    if (cached) {
      // Cache HIT - return instantly
      return NextResponse.json(
        {
          answer: cached.answer,
          model: cached.model,
          modelHuman: cached.modelHuman,
          latencyMs: 0, // Instant from cache
          tier: cached.tier,
          attempts: cached.attempts,
          cached: true,
          cachedAt: cached.cachedAt,
        },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            'X-Cache': 'HIT',
          },
        }
      )
    }

    // 2. Cache MISS - Fetch search context for grounding
    let context = await getSerpResults(query)
    
    // Fallback if SerpApi empty
    if (!context || context.length === 0) {
       const googleResults = await getWebSearchResults(query)
       context = googleResults.map(r => ({
         title: r.title,
         snippet: r.snippet,
         link: r.link,
         source: r.displayLink
       }))
    }

    // 3. Generate grounded answer
    const result = await generateAIAnswer(query, context)
    
    // 4. Cache the result for future queries
    if (result.answer && result.model !== 'none') {
      const cacheEntry: CachedAnswer = {
        answer: result.answer,
        model: result.model,
        modelHuman: result.modelHuman,
        tier: result.tier,
        latencyMs: result.latencyMs,
        attempts: result.attempts,
        cachedAt: Date.now(),
        originalQuery: query,
      }
      setCachedAnswer(query, cacheEntry, 'answer')
    }
    
    return NextResponse.json(
      {
        answer: result.answer,
        model: result.model,
        modelHuman: result.modelHuman,
        latencyMs: result.latencyMs,
        tier: result.tier,
        attempts: result.attempts,
        cached: false,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'X-Cache': 'MISS',
        },
      }
    )
  } catch (error) {
    console.error('Error in /api/ai/answer:', error)
    return NextResponse.json(
      { error: 'Failed to generate answer' },
      { status: 500 }
    )
  }
}
