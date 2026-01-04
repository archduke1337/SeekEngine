/**
 * OpenRouter AI Integration
 * Handles AI suggestions and answers via OpenRouter free-tier models
 * Updated with VERIFIED working model IDs and ZOD validation
 */

import { suggestionsResponseSchema, answerResponseSchema } from './validation'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

/**
 * Verified Free Models from OpenRouter (Jan 2026)
 */
const FREE_MODELS = [
  'google/gemini-2.0-flash-exp:free',
  'xiaomi/mimo-v2-flash:free',
  'deepseek/deepseek-chat:free',
  'google/gemma-2-9b-it:free',
  'mistralai/mistral-7b-instruct:free',
  'microsoft/phi-3-mini-128k-instruct:free',
  'google/gemma-3-27b-it:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'qwen/qwen-2.5-72b-instruct:free',
  'mistralai/mistral-small-24b-instruct-2501:free'
]

/**
 * Helper to call OpenRouter with model fallbacks
 * Optimized with AbortController to prevent Vercel 504 Timeouts
 */
async function callOpenRouter(
  messages: { role: string; content: string }[],
  maxTokens: number = 800
): Promise<string | null> {
  if (!OPENROUTER_API_KEY) {
    console.warn('⚠️ OPENROUTER_API_KEY is missing. AI features disabled.')
    return null
  }
  
  const startTime = Date.now()
  const GLOBAL_TIMEOUT = 8500 // 8.5 seconds total limit for Vercel

  for (const model of FREE_MODELS) {
    // Check if we approach global timeout
    if (Date.now() - startTime > GLOBAL_TIMEOUT) {
      console.warn('⚠️ Global timeout reached. Aborting AI chain.')
      return null
    }

    try {
      console.log(`📡 Trying AI: ${model}...`)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 4500) // 4.5s per model

      const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://github.com/archduke1337/seekengine',
          'X-Title': 'SeekEngine',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.6,
          max_tokens: maxTokens,
          top_p: 1,
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        console.warn(`❌ Fail: ${model} (${response.status})`)
        continue
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content
      
      if (content) {
        console.log(`✅ Success: ${model}`)
        return content
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.warn(`⏱️ Timeout: ${model}`)
      } else {
        console.warn(`❌ Error with ${model}:`, error.message)
      }
      continue
    }
  }
  return null
}

/**
 * Get AI-powered search suggestions
 */
export async function getSearchSuggestions(query: string): Promise<string[]> {
  const messages = [
    {
      role: 'user',
      content: `Generate 5-7 concise search query suggestions for: "${query}". Return ONLY a JSON array of strings.`,
    },
  ]

  try {
    const content = await callOpenRouter(messages, 200)
    if (!content) return generateFallbackSuggestions(query)
    
    const jsonMatch = content.match(/\[[\s\S]*?\]/)
    if (!jsonMatch) return generateFallbackSuggestions(query)
    
    // Validate with ZOD
    const suggestions = JSON.parse(jsonMatch[0])
    const validated = suggestionsResponseSchema.safeParse({ suggestions })
    
    return validated.success ? validated.data.suggestions : generateFallbackSuggestions(query)
  } catch (error) {
    return generateFallbackSuggestions(query)
  }
}

function generateFallbackSuggestions(query: string): string[] {
  return [
    `${query} meaning`,
    `what is ${query}`,
    `how to use ${query}`,
    `${query} examples`,
    `${query} latest news`
  ]
}

/**
 * Generate AI-powered answer/summary using real-time search context
 */
export async function generateAIAnswer(query: string, context?: any[]): Promise<string> {
  const contextText = context?.map((r, i) => `[${i+1}] "${r.title}": ${r.snippet}`).join('\n') || ''
  
  const messages = [
    {
      role: 'system',
      content: `You are SeekEngine AI. Concise markdown. ${contextText ? `Source base:\n${contextText}` : ''} Cite as [1], [2].`,
    },
    {
      role: 'user',
      content: query,
    },
  ]

  try {
    const content = await callOpenRouter(messages, 800)
    
    // Validate with ZOD
    const validated = answerResponseSchema.safeParse({ answer: content || '' })
    return validated.success ? validated.data.answer : 'AI summary unavailable.'
  } catch (error) {
    return 'An error occurred during synthesis.'
  }
}
