import { NextResponse } from 'next/server'
import { getWebSearchResults } from '@/lib/google-search'
import { getSerpResults } from '@/lib/serpapi'
import { ENV } from '@/lib/env'

export const runtime = 'edge'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 })
  }

  try {
    // Attempt SerpApi first
    const serpResults = await getSerpResults(query)
    
    // Fallback to Google Custom Search
    if (serpResults && serpResults.length > 0) {
      return NextResponse.json({ results: serpResults })
    }

    const webResults = await getWebSearchResults(query)
    
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
