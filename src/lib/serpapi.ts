/**
 * SerpApi Google Search Integration
 * Provides high-fidelity, real-time Google search results
 */

import { ENV } from './env'

const SERPAPI_KEY = ENV.SERPAPI_KEY
const SERPAPI_URL = 'https://serpapi.com/search'

export interface SerpResult {
  title: string
  link: string
  snippet: string
  source: string
}

/**
 * Fetch real-time search results from SerpApi
 */
export async function getSerpResults(query: string, timeRange?: string): Promise<SerpResult[]> {
  if (!SERPAPI_KEY) {
    console.warn('⚠️ SERPAPI_KEY is missing.')
    return []
  }

  try {
    const url = new URL(SERPAPI_URL)
    url.searchParams.append('q', query)
    url.searchParams.append('api_key', SERPAPI_KEY)
    url.searchParams.append('engine', 'google')
    url.searchParams.append('num', '8')
    if (timeRange) url.searchParams.append('tbs', timeRange)

    const response = await fetch(url.toString())
    
    if (!response.ok) {
      console.error(`❌ SerpApi Error: ${response.status}`)
      return []
    }

    const data = await response.json()

    if (!data.organic_results) {
      return []
    }

    return data.organic_results.map((item: any) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet || item.about_this_result?.source?.description || '',
      source: item.source || item.display_link || ''
    }))
  } catch (error) {
    console.error('Error fetching SerpApi results:', error)
    return []
  }
}
