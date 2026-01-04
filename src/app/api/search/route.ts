/**
 * API Route: /api/search
 * Fetches web search results from Google Custom Search with validation
 */

import { getWebSearchResults } from '../../../lib/google-search'
import { getSerpResults } from '../../../lib/serpapi'
import { validateSearchQuery } from '../../../lib/validation'
import { NextRequest, NextResponse } from 'next/server'

// Note: Can't use edge runtime here due to Google API requirements
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

  const startIndex = Math.max(1, parseInt(searchParams.get('start') || '1', 10))

  try {
    // Try SerpApi first for real-time results
    let results = await getSerpResults(validation.query!)

    // Fallback to Google Custom Search if SerpApi results are empty
    if (!results || results.length === 0) {
      console.log('🔄 Falling back to Google Custom Search')
      const googleResults = await getWebSearchResults(validation.query!, startIndex)
      results = googleResults.map(r => ({
        title: r.title,
        link: r.link,
        snippet: r.snippet,
        source: r.displayLink
      }))
    }
    
    return NextResponse.json(
      { results },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    )
  } catch (error) {
    console.error('Error in /api/search:', error)
    return NextResponse.json(
      { error: 'Failed to fetch search results' },
      { status: 500 }
    )
  }
}
