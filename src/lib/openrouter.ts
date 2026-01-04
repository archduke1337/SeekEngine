/**
 * OpenRouter AI Integration
 * Handles AI suggestions and answers via OpenRouter free-tier models
 * Updated with VERIFIED working model IDs and ZOD validation
 */

import axios from 'axios'
import { suggestionsResponseSchema, answerResponseSchema } from './validation'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

if (!OPENROUTER_API_KEY) {
  throw new Error('OPENROUTER_API_KEY is not set in environment variables')
}

/**
 * Verified Free Models from OpenRouter (Jan 2026)
 */
const FREE_MODELS = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemma-3-27b-it:free',
  'deepseek/deepseek-r1-0528:free',
  'google/gemini-2.0-flash-exp:free',
  'mistralai/mistral-small-3.1-24b-instruct:free',
  'qwen/qwen3-coder:free',
  'google/gemma-3-12b-it:free',
  'meta-llama/llama-3.2-3b-instruct:free',
  'google/gemma-3-4b-it:free',
  'qwen/qwen3-4b:free',
  'mistralai/mistral-7b-instruct:free',
  'allenai/olmo-3.1-32b-think:free',
  'nvidia/nemotron-3-nano-30b-a3b:free',
  'meta-llama/llama-3.1-405b-instruct:free',
]

/**
 * Helper to call OpenRouter with model fallbacks
 */
async function callOpenRouter(
  messages: { role: string; content: string }[],
  maxTokens: number = 800
): Promise<string | null> {
  
  for (const model of FREE_MODELS) {
    try {
      console.log(`📡 Trying AI: ${model}...`)
      const response = await axios.post(
        `${OPENROUTER_BASE_URL}/chat/completions`,
        {
          model,
          messages,
          temperature: 0.6,
          max_tokens: maxTokens,
          top_p: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'https://github.com/archduke1337/seekengine',
            'X-Title': 'SeekEngine',
            'Content-Type': 'application/json',
          },
          timeout: 45000,
        }
      )

      const content = response.data.choices?.[0]?.message?.content
      if (content) {
        console.log(`✅ Success: ${model}`)
        return content
      }
    } catch (error: any) {
      console.warn(`❌ Fail: ${model} (${error.response?.status})`)
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
 * Generate AI-powered answer/summary
 */
export async function generateAIAnswer(query: string): Promise<string> {
  const messages = [
    {
      role: 'system',
      content: 'You are SeekEngine AI. Provide a professional, concise markdown summary. Use headers and bold text for clarity.',
    },
    {
      role: 'user',
      content: `Respond to: "${query}"`,
    },
  ]

  try {
    const content = await callOpenRouter(messages, 800)
    
    // Validate with ZOD
    const validated = answerResponseSchema.safeParse({ answer: content || '' })
    return validated.success ? validated.data.answer : 'AI summary unavailable.'
  } catch (error) {
    return 'An error occurred.'
  }
}
