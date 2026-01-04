/**
 * Google Custom Search Integration
 * Handles traditional web search results
 */

import axios from 'axios'

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
const GOOGLE_CX = process.env.GOOGLE_CX
const GOOGLE_SEARCH_URL = 'https://www.googleapis.com/customsearch/v1'

if (!GOOGLE_API_KEY || !GOOGLE_CX) {
  throw new Error('GOOGLE_API_KEY or GOOGLE_CX is not set in environment variables')
}

export interface SearchResult {
  title: string
  link: string
  snippet: string
  displayLink: string
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
  try {
    const response = await axios.get(GOOGLE_SEARCH_URL, {
      params: {
        q: query,
        key: GOOGLE_API_KEY,
        cx: GOOGLE_CX,
        start: startIndex,
        num: 10,
      },
    })

    if (!response.data.items) {
      return []
    }

    return response.data.items.map((item: any) => ({
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
