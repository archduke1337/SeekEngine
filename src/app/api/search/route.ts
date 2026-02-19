import { NextResponse } from 'next/server'
import { getWebSearchResults } from '@/lib/google-search'
import { getSerpResults } from '@/lib/serpapi'
import { checkRateLimit, getClientIP, RATE_LIMITS, rateLimitResponse } from '@/lib/rate-limit'

export const runtime = 'edge'

export async function GET(request: Request) {
  // Rate limiting
  const ip = getClientIP(request)
  const rl = checkRateLimit(`search:${ip}`, RATE_LIMITS.search)
  if (!rl.allowed) return rateLimitResponse(rl)

  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 })
  }

  console.log(`🔍 [SEARCH] Query: "${query}"`)

  const timeRange = searchParams.get('time') || undefined
  // Map time filter to API-specific params
  const tbsMap: Record<string, string> = { h: 'qdr:h', d: 'qdr:d', w: 'qdr:w', m: 'qdr:m', y: 'qdr:y' }
  const dateRestrictMap: Record<string, string> = { h: 'd1', d: 'd1', w: 'w1', m: 'm1', y: 'y1' }
  const tbs = timeRange ? tbsMap[timeRange] : undefined
  const dateRestrict = timeRange ? dateRestrictMap[timeRange] : undefined

  try {
    // Attempt SerpApi first
    const serpResults = await getSerpResults(query, tbs)
    
    // Fallback to Google Custom Search
    if (serpResults && serpResults.length > 0) {
      return NextResponse.json({ results: serpResults })
    }

    const webResults = await getWebSearchResults(query, 1, dateRestrict)
    
    // Normalize web results to match SerpResult shape for the UI
    const normalizedResults = webResults.map(r => ({
      title: r.title,
      link: r.link,
      snippet: r.snippet,
      source: r.source || r.displayLink || ''
    }))

    return NextResponse.json({ results: normalizedResults })
    
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
