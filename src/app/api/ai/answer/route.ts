/**
 * API Route: /api/ai/answer
 * Returns AI-generated answer/summary with validation
 */

import { generateAIAnswer } from '../../../../lib/openrouter'
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
    const answer = await generateAIAnswer(validation.query!)
    
    return NextResponse.json(
      { answer },
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
