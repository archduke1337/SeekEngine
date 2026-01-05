/**
 * OpenRouter AI Integration (V3 - Self-Updating)
 * 
 * Key features:
 * - Programmatically fetches all free models from OpenRouter
 * - Filters to text-capable models only
 * - Caches results (edge-safe, 30min TTL)
 * - Falls back to static list if OpenRouter is down
 * - Self-healing model health memory
 * - ZOD validation boundaries
 */

import { suggestionsResponseSchema, answerResponseSchema } from './validation'

// ─────────────────────────────────────────────────────────────────────────────
// 1️⃣ CONSTANTS & TYPES
// ─────────────────────────────────────────────────────────────────────────────

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'
const MODELS_ENDPOINT = 'https://openrouter.ai/api/v1/models'

type ChatRole = 'system' | 'user' | 'assistant'
type ChatMessage = { role: ChatRole; content: string }

type OpenRouterModel = {
  id: string
  pricing?: {
    prompt?: number
    completion?: number
  }
  architecture?: {
    output_modalities?: string[]
  }
  context_length?: number
}

// ─────────────────────────────────────────────────────────────────────────────
// 2️⃣ STATIC FALLBACK MODELS (Emergency Only)
// Used only if OpenRouter /models endpoint is unreachable
// ─────────────────────────────────────────────────────────────────────────────

const STATIC_FALLBACK_MODELS = [
  'mistral/devstral-2-2512:free',
  'deepseek/deepseek-chat:free',
  'google/gemini-2.0-flash-exp:free',
  'xiaomi/mimo-v2-flash:free',
  'nvidia/nemotron-nano-12b-v2-vl:free',
  'nvidia/nemotron-nano-9b-v2:free',
  'allenai/olmo-3.1-32b-think:free',
  'qwen/qwen-2.5-72b-instruct:free',
  'google/gemma-3n-e4b-it:free',
  'meta-llama/llama-3.2-3b-instruct:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'tngtech/deepseek-r1t2-chimera:free',
  'tngtech/deepseek-r1t-chimera:free',
  'qwen/qwen-3-4b:free',
  'qwen/qwen-2.5-vl-7b-instruct:free',
  'arcee-ai/trinity-mini:free',
  'moonshotai/kimi-k2:free',
  'openai/gpt-oss-20b:free',
  'openai/gpt-oss-120b:free',
  'qwen/qwen3-coder:free',
  'mistralai/mistral-small-24b-instruct-2501:free',
  'nex-agi/deepseek-v3.1-nex-n1:free',
]

// ─────────────────────────────────────────────────────────────────────────────
// 3️⃣ MODEL CACHE (Edge-Safe, In-Memory)
// ─────────────────────────────────────────────────────────────────────────────

let cachedFreeTextModels: string[] | null = null
let lastFetchTime = 0
const CACHE_TTL = 1000 * 60 * 30 // 30 minutes

// ─────────────────────────────────────────────────────────────────────────────
// 4️⃣ MODEL HEALTH MEMORY (Self-Healing)
// Models that fail repeatedly are temporarily skipped
// ─────────────────────────────────────────────────────────────────────────────

const modelFailures = new Map<string, number>()
const MAX_MODEL_FAILURES = 3

// ─────────────────────────────────────────────────────────────────────────────
// 5️⃣ FREE + TEXT-ONLY FILTER LOGIC
// Matches: max_price=0 & output_modalities=text
// ─────────────────────────────────────────────────────────────────────────────

function isFree(model: OpenRouterModel): boolean {
  const pricing = model.pricing
  if (!pricing) return false
  return pricing.prompt === 0 && pricing.completion === 0
}

function supportsText(model: OpenRouterModel): boolean {
  return model.architecture?.output_modalities?.includes('text') ?? false
}

// ─────────────────────────────────────────────────────────────────────────────
// 6️⃣ DYNAMIC MODEL FETCHER (Cached)
// Fetches from OpenRouter, filters, caches, falls back gracefully
// ─────────────────────────────────────────────────────────────────────────────

async function getFreeTextModels(): Promise<string[]> {
  const now = Date.now()

  // Return cached models if still valid
  if (cachedFreeTextModels && now - lastFetchTime < CACHE_TTL) {
    return cachedFreeTextModels
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const res = await fetch(MODELS_ENDPOINT, {
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!res.ok) {
      throw new Error(`Models fetch failed: ${res.status}`)
    }

    const data = await res.json()
    const models: OpenRouterModel[] = data?.data ?? []

    // Filter: free + text-capable
    let freeTextModels = models
      .filter(isFree)
      .filter(supportsText)

    // Sort by context length (smaller/faster first) if available
    freeTextModels.sort((a, b) => (a.context_length || 0) - (b.context_length || 0))

    // Normalize IDs with :free suffix
    const modelIds = freeTextModels.map(m => 
      m.id.endsWith(':free') ? m.id : `${m.id}:free`
    )

    if (modelIds.length > 0) {
      cachedFreeTextModels = modelIds
      lastFetchTime = now
      console.log(`📡 Loaded ${modelIds.length} free text models from OpenRouter`)
      return modelIds
    }

    throw new Error('No free text models found')
  } catch (err) {
    console.warn('⚠️ Falling back to static free models list:', (err as Error).message)
    return STATIC_FALLBACK_MODELS
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7️⃣ CORE OPENROUTER CALLER
// ─────────────────────────────────────────────────────────────────────────────

async function callOpenRouter(
  messages: ChatMessage[],
  maxTokens = 800,
  temperature = 0.4
): Promise<string | null> {
  if (!OPENROUTER_API_KEY) {
    console.warn('⚠️ OPENROUTER_API_KEY missing')
    return null
  }

  // Fetch current free models (cached)
  const models = await getFreeTextModels()
  
  const startTime = Date.now()
  const GLOBAL_TIMEOUT = 10_000

  for (const model of models) {
    // Skip models that have failed too many times
    if ((modelFailures.get(model) || 0) >= MAX_MODEL_FAILURES) {
      continue
    }

    // Check global timeout before trying next model
    if (Date.now() - startTime > GLOBAL_TIMEOUT) {
      console.warn('⏱️ Global timeout reached')
      return null
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 4_500)

    try {
      const response = await fetch(
        `${OPENROUTER_BASE_URL}/chat/completions`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://github.com/archduke1337/seekengine',
            'X-Title': 'SeekEngine',
          },
          body: JSON.stringify({
            model,
            messages,
            temperature,
            max_tokens: maxTokens,
            top_p: 1,
          }),
          signal: controller.signal,
        }
      )

      clearTimeout(timeoutId)

      // Retry-worthy transient errors (rate limit, server errors)
      if ([429, 500, 502, 503].includes(response.status)) {
        await new Promise(r => setTimeout(r, 300))
        continue
      }

      // Non-transient failure: mark model as unhealthy
      if (!response.ok) {
        modelFailures.set(model, (modelFailures.get(model) || 0) + 1)
        continue
      }

      const data = await response.json()
      const content = data?.choices?.[0]?.message?.content

      if (content) {
        console.log(`✅ Response from: ${model}`)
        return content
      }
    } catch (err: unknown) {
      const error = err as Error
      if (error.name !== 'AbortError') {
        modelFailures.set(model, (modelFailures.get(model) || 0) + 1)
      }
    } finally {
      clearTimeout(timeoutId)
    }
  }

  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// 8️⃣ HARDENED JSON EXTRACTION UTILITY
// Avoids: markdown wrappers, trailing explanations, pseudo-JSON lists
// ─────────────────────────────────────────────────────────────────────────────

function extractJsonArray(text: string): string | null {
  const match = text.match(/\[\s*"[\s\S]*?"\s*\]/)
  return match ? match[0] : null
}

// ─────────────────────────────────────────────────────────────────────────────
// 9️⃣ SEARCH SUGGESTIONS
// ─────────────────────────────────────────────────────────────────────────────

export async function getSearchSuggestions(query: string): Promise<string[]> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content:
        'You are SeekEngine Intelligence Optimizer. Output EXACTLY 5 high-value search paths as a pure JSON array of strings.',
    },
    {
      role: 'user',
      content: `Generate intelligence paths for: "${query}"`,
    },
  ]

  const content = await callOpenRouter(messages, 200, 0.75)
  if (!content) return generateFallbackSuggestions(query)

  try {
    const json = extractJsonArray(content)
    if (!json) throw new Error('No JSON array found')

    const parsed = JSON.parse(json)
    const validated = suggestionsResponseSchema.safeParse({ suggestions: parsed })

    return validated.success
      ? validated.data.suggestions.slice(0, 5)
      : generateFallbackSuggestions(query)
  } catch {
    return generateFallbackSuggestions(query)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 🔟 ANSWER GENERATION (Grounded + Safe)
// ─────────────────────────────────────────────────────────────────────────────

export async function generateAIAnswer(
  query: string,
  context?: { title: string; snippet: string }[]
): Promise<string> {
  const contextText =
    context
      ?.map((r, i) => `[${i + 1}] "${r.title}": ${r.snippet}`)
      .join('\n') || ''

  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are SeekEngine AI. Concise markdown. ${
        contextText ? `Source base:\n${contextText}` : ''
      } Cite as [1], [2].`,
    },
    {
      role: 'user',
      content: query,
    },
  ]

  const content = await callOpenRouter(messages, 800, 0.35)
  const validated = answerResponseSchema.safeParse({ answer: content || '' })

  return validated.success ? validated.data.answer : 'AI summary unavailable.'
}

// ─────────────────────────────────────────────────────────────────────────────
// 1️⃣1️⃣ FALLBACK GENERATOR
// ─────────────────────────────────────────────────────────────────────────────

function generateFallbackSuggestions(query: string): string[] {
  return [
    `${query} technical specification`,
    `${query} comparative analysis`,
    `latest developments in ${query}`,
    `${query} implementation guide`,
    `common pitfalls of ${query}`,
  ]
}
