/**
 * API Route: /api/ai/suggest
 * Returns AI-powered search suggestions with validation
 */

import { getSearchSuggestions } from '../../../../lib/openrouter'
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
    const result = await getSearchSuggestions(validation.query!)
    
    return NextResponse.json(
      {
        suggestions: result.suggestions,
        model: result.model,
        modelHuman: result.modelHuman,
        latencyMs: result.latencyMs,
        attempts: result.attempts,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
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
