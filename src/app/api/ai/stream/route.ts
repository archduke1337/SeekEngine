/**
 * API Route: /api/ai/stream
 * Returns streaming AI-generated answer via Server-Sent Events (SSE)
 * With semantic cache integration for instant cached responses
 * 
 * Events emitted:
 * - cache_hit: Instant cached response (no streaming needed)
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
import { 
  getCachedAnswer, 
  setCachedAnswer,
  type CachedAnswer 
} from '../../../../lib/semantic-cache'
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

  const query = validation.query!
  console.log(`🤖 [AI STREAM] Query: "${query}"`)

  try {
    // 1. Semantic Cache DISABLED per user request
    // To re-enable, uncomment the getCachedAnswer logic here
    
    // 2. Fetch search context for grounding
    console.log(`🌐 [RAG] Fetching search context for: "${query}"`)
    let context = await getSerpResults(query)
    let source = 'SerpApi'
    
    // Fallback if SerpApi empty
    if (!context || context.length === 0) {
       console.log(`⚠️  SerpApi returned no results, falling back to Google Custom Search...`)
       const googleResults = await getWebSearchResults(query)
       context = googleResults.map(r => ({
         title: r.title,
         snippet: r.snippet,
         link: r.link,
         source: r.displayLink
       }))
       source = 'Google Search'
    }

    console.log(`✅ [CONTEXT] Found ${context.length} results from ${source}`)

    // 3. Create streaming response (Direct, NO CACHE WRITE)
    const stream = createStreamingAnswerResponse(
      query,
      context,
      request.signal
    )
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
        'X-Cache': 'MISS',
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
