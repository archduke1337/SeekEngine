/**
 * Google Custom Search Integration
 * Handles traditional web search results
 */

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
const GOOGLE_CX = process.env.GOOGLE_CX
const GOOGLE_SEARCH_URL = 'https://www.googleapis.com/customsearch/v1'

export interface SearchResult {
  title: string
  link: string
  snippet: string
  displayLink: string
  source?: string
}

/**
 * Fetch web search results from Google Custom Search
 * @param query - The search query
 * @param startIndex - Pagination start index (default: 1)
 * @returns Array of search results
 */
export async function getWebSearchResults(
  query: string,
  startIndex: number = 1
): Promise<SearchResult[]> {
  if (!GOOGLE_API_KEY || !GOOGLE_CX) {
    console.warn('⚠️ Google API Key or CX is missing. Search will be empty.')
    return []
  }

  try {
    const url = new URL(GOOGLE_SEARCH_URL)
    url.searchParams.append('q', query)
    url.searchParams.append('key', GOOGLE_API_KEY)
    url.searchParams.append('cx', GOOGLE_CX)
    url.searchParams.append('start', startIndex.toString())
    url.searchParams.append('num', '10')

    const response = await fetch(url.toString())
    
    if (!response.ok) {
      console.error(`❌ Google Search Error: ${response.status}`)
      return []
    }

    const data = await response.json()

    if (!data.items) {
      return []
    }

    return data.items.map((item: any) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
      displayLink: item.displayLink,
    }))
  } catch (error) {
    console.error('Error fetching web search results:', error)
    return []
  }
}
