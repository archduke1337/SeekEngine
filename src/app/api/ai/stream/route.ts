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

  try {
    // 1. Check semantic cache first
    const cached = getCachedAnswer(query, 'answer')
    
    if (cached) {
      // Cache HIT - send instant SSE response with cached data
      const encoder = new TextEncoder()
      const cacheEvent = {
        type: 'cache_hit',
        content: cached.answer,
        model: cached.model,
        modelHuman: cached.modelHuman,
        tier: cached.tier,
        latencyMs: 0,
        attempts: cached.attempts,
        cachedAt: cached.cachedAt,
      }
      
      const stream = new ReadableStream({
        start(controller) {
          // Emit thinking briefly for smooth UX
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'thinking', content: 'Retrieving...' })}\n\n`))
          
          // Then emit the cached response as done
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'done',
            ...cacheEvent,
          })}\n\n`))
          
          controller.close()
        }
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
          'X-Cache': 'HIT',
        },
      })
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

    // 3. Create streaming response with cache write on completion
    const stream = createStreamingAnswerResponseWithCache(
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

/**
 * Creates a streaming response that also caches the result on completion
 */
function createStreamingAnswerResponseWithCache(
  query: string,
  context: { title: string; snippet: string }[],
  abortSignal?: AbortSignal
): ReadableStream<Uint8Array> {
  const baseStream = createStreamingAnswerResponse(query, context, abortSignal)
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  
  let fullContent = ''
  let metadata: Partial<CachedAnswer> = {}
  
  return new ReadableStream({
    async start(controller) {
      const reader = baseStream.getReader()
      
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          // Pass through the chunk
          controller.enqueue(value)
          
          // Parse events to capture content and metadata for caching
          const text = decoder.decode(value, { stream: true })
          const lines = text.split('\n\n')
          
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            
            try {
              const event = JSON.parse(line.slice(6))
              
              if (event.type === 'token' && event.content) {
                fullContent += event.content
              }
              
              if (event.type === 'done') {
                metadata = {
                  model: event.model,
                  modelHuman: event.modelHuman,
                  tier: event.tier,
                  latencyMs: event.latencyMs,
                  attempts: event.attempts,
                }
                
                // Cache the complete answer
                if (fullContent && event.model && event.model !== 'none') {
                  const cacheEntry: CachedAnswer = {
                    answer: fullContent,
                    model: event.model,
                    modelHuman: event.modelHuman,
                    tier: event.tier,
                    latencyMs: event.latencyMs,
                    attempts: event.attempts,
                    cachedAt: Date.now(),
                    originalQuery: query,
                  }
                  setCachedAnswer(query, cacheEntry, 'answer')
                }
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
        
        controller.close()
      } catch (error) {
        controller.error(error)
      }
    }
  })
}
