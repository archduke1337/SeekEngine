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
  'mistralai/mistral-small-24b-instruct-2501:free',
  'allenai/olmo-3.1-32b-think:free',
  'nvidia/nemotron-3-nano-30b-a3b:free',
  'nex-agi/deepseek-v3.1-nex-n1:free',
  'arcee-ai/trinity-mini:free',
  'allenai/olmo-3-32b-think:free',
  'nvidia/nemotron-nano-12b-v2-vl:free',
  'nvidia/nemotron-nano-9b-v2:free',
  'openai/gpt-oss-120b:free',
  'openai/gpt-oss-20b:free',
  'qwen/qwen3-coder:free',
  'moonshotai/kimi-k2:free',
  'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
  'google/gemma-3n-e2b-it:free',
  'tngtech/deepseek-r1t2-chimera:free',
  'deepseek/deepseek-r1-0528:free',
  'google/gemma-3n-e4b-it:free',
  'qwen/qwen3-4b:free',
  'tngtech/deepseek-r1t-chimera:free',
  'google/gemma-3-12b-it:free',
  'google/gemma-3-27b-it:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'meta-llama/llama-3.2-3b-instruct:free',
  'qwen/qwen-2.5-vl-7b-instruct:free',
  'nousresearch/hermes-3-llama-3.1-405b:free',
  'meta-llama/llama-3.1-405b-instruct:free',
  'mistralai/mistral-7b-instruct:free',
  'google/gemma-3-12b-it:free',
  'google/gemma-3-27b-it:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'meta-llama/llama-3.2-3b-instruct:free',
  'qwen/qwen-2.5-vl-7b-instruct:free',
  'nousresearch/hermes-3-llama-3.1-405b:free',
  'meta-llama/llama-3.1-405b-instruct:free',
  'mistralai/mistral-7b-instruct:free',

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
      role: 'system',
      content: `You are SeekEngine's Intelligence Optimizer. 
      Analyze the user's intent and output EXACTLY 5 high-value search paths.
      Include a mix of: deep technical inquiry, comparative analysis, and practical application.
      Output ONLY a JSON array of strings. No markdown. Format: ["A", "B"]`,
    },
    {
      role: 'user',
      content: `Generate intelligence paths for: "${query}"`,
    },
  ]

  try {
    const content = await callOpenRouter(messages, 200)
    if (!content) return generateFallbackSuggestions(query)
    
    // Robust extraction for various model output styles
    const jsonMatch = content.match(/\[[\s\S]*?\]/)
    const cleanJson = jsonMatch ? jsonMatch[0] : content.trim()
    
    try {
      const suggestions = JSON.parse(cleanJson.replace(/```json|```/g, ''))
      const validated = suggestionsResponseSchema.safeParse({ suggestions })
      
      return validated.success ? validated.data.suggestions.slice(0, 5) : generateFallbackSuggestions(query)
    } catch (parseError) {
      console.warn('⚠️ Suggestion parse error:', parseError)
      return generateFallbackSuggestions(query)
    }
  } catch (error) {
    return generateFallbackSuggestions(query)
  }
}

function generateFallbackSuggestions(query: string): string[] {
  return [
    `${query} technical specification`,
    `${query} comparative analysis`,
    `latest developments in ${query}`,
    `${query} implementation guide`,
    `common pitfalls of ${query}`
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
