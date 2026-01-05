/**
 * API Route: /api/ai/answer
 * Returns AI-generated answer/summary with validation
 */

import { generateAIAnswer } from '../../../../lib/openrouter'
import { getSerpResults } from '../../../../lib/serpapi'
import { getWebSearchResults } from '../../../../lib/google-search'
import { validateSearchQuery } from '../../../../lib/validation'
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

  try {
    // 1. Fetch search context for grounding
    let context = await getSerpResults(validation.query!)
    
    // Fallback if SerpApi empty
    if (!context || context.length === 0) {
       const googleResults = await getWebSearchResults(validation.query!)
       context = googleResults.map(r => ({
         title: r.title,
         snippet: r.snippet,
         link: r.link,
         source: r.displayLink
       }))
    }

    // 2. Generate grounded answer
    const result = await generateAIAnswer(validation.query!, context)
    
    return NextResponse.json(
      {
        answer: result.answer,
        model: result.model,
        modelHuman: result.modelHuman,
        latencyMs: result.latencyMs,
        tier: result.tier,
        attempts: result.attempts,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
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
