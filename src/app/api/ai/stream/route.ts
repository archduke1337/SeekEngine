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
import { checkRateLimit, getClientIP, RATE_LIMITS, rateLimitResponse } from '../../../../lib/rate-limit'
import { getCachedAnswer, setCachedAnswer, type CachedAnswer } from '../../../../lib/semantic-cache'
import { NextRequest } from 'next/server'

// Enable edge runtime for streaming support
export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Rate limiting
  const ip = getClientIP(request)
  const rl = checkRateLimit(`stream:${ip}`, RATE_LIMITS.stream)
  if (!rl.allowed) return rateLimitResponse(rl)

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
    // 1. Semantic Cache check
    const cached = getCachedAnswer(query, 'stream')
    if (cached) {
      console.log(`📦 [STREAM CACHE HIT] Returning cached answer for: "${query.slice(0, 40)}..."`)
      const encoder = new TextEncoder()
      const body = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'cache_hit', content: cached.answer, model: cached.model, modelHuman: cached.modelHuman })}\n\n`))
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', cached: true })}\n\n`))
          controller.close()
        }
      })
      return new Response(body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
          'X-Cache': 'HIT',
        },
      })
    }

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
         source: r.displayLink || ''
       }))
       source = 'Google Search'
    }

    console.log(`✅ [CONTEXT] Found ${context.length} results from ${source}`)

    // 3. Create streaming response with cache write
    const stream = createStreamingAnswerResponse(
      query,
      context,
      request.signal
    )

    // Wrap stream to capture tokens for caching
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()
    let fullAnswer = ''
    let modelInfo = { model: '', modelHuman: '' }

    const cacheTransform = new TransformStream({
      transform(chunk, controller) {
        controller.enqueue(chunk)
        const text = decoder.decode(chunk, { stream: true })
        // Parse SSE events from chunk
        // Format: data: {"type":"token","content":"..."}\n\n
        for (const line of text.split('\n')) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.type === 'token' && data.content) fullAnswer += data.content
              if (data.model) modelInfo.model = data.model
              if (data.modelHuman) modelInfo.modelHuman = data.modelHuman
              if (data.type === 'done') {
                // Cache the completed answer
                if (fullAnswer.length > 50) {
                  const entry: CachedAnswer = {
                    answer: fullAnswer,
                    model: modelInfo.model,
                    modelHuman: modelInfo.modelHuman,
                    tier: 'stream',
                    latencyMs: 0,
                    attempts: 1,
                    cachedAt: Date.now(),
                    originalQuery: query,
                  }
                  setCachedAnswer(query, entry, 'stream')
                  console.log(`📦 [STREAM CACHE WRITE] Cached ${fullAnswer.length} chars for: "${query.slice(0, 40)}..."`)
                }
              }
            } catch { /* non-JSON data line */ }
          }
        }
      }
    })

    const cachedStream = stream.pipeThrough(cacheTransform)
    
    return new Response(cachedStream, {
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
