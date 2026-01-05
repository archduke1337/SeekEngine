/**
 * API Route: /api/ai/stream
 * Returns streaming AI-generated answer via Server-Sent Events (SSE)
 * 
 * Events emitted:
 * - thinking: Initial connection state
 * - model_selected: Which model was chosen
 * - token: Each token as it arrives
 * - done: Final completion with metadata
 * - error: If something went wrong
 */

import { createStreamingAnswerResponse } from '../../../../lib/openrouter'
import { getSerpResults } from '../../../../lib/serpapi'
import { getWebSearchResults } from '../../../../lib/google-search'
import { validateSearchQuery } from '../../../../lib/validation'
import { NextRequest } from 'next/server'

// Enable edge runtime for streaming support
export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  // Validate query
  const validation = validateSearchQuery(searchParams)
  if (!validation.valid) {
    return new Response(
      JSON.stringify({ error: validation.error }),
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }

  try {
    // 1. Fetch search context for grounding (non-blocking)
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

    // 2. Create streaming response
    const stream = createStreamingAnswerResponse(validation.query!, context)
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable nginx buffering
      },
    })
  } catch (error) {
    console.error('Error in /api/ai/stream:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to start stream' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}
