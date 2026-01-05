/**
 * OpenRouter AI Integration (V4 - Task-Aware Routing)
 * 
 * Features:
 * - Task-aware model routing (suggestions vs answers vs code)
 * - Policy-driven temperature and token limits
 * - Model tier classification (fast → balanced → heavy → code)
 * - Dynamic model fetching with caching
 * - Self-healing model health memory
 * - Basic telemetry logging
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
// 2️⃣ TASK DEFINITIONS & POLICIES
// ─────────────────────────────────────────────────────────────────────────────

export enum AITask {
  SUGGESTIONS = 'suggestions',
  ANSWER = 'answer',
  CODE = 'code',
}

type ModelTier = 'fast' | 'balanced' | 'heavy' | 'code'

interface TaskPolicy {
  temperature: number
  maxTokens: number
  preferredTiers: ModelTier[]
  maxLatency: number // per-model timeout in ms
  globalTimeout: number // total time allowed
}

const TASK_POLICIES: Record<AITask, TaskPolicy> = {
  [AITask.SUGGESTIONS]: {
    temperature: 0.8,
    maxTokens: 200,
    preferredTiers: ['fast', 'balanced'],
    maxLatency: 3000,
    globalTimeout: 6000,
  },
  [AITask.ANSWER]: {
    temperature: 0.35,
    maxTokens: 800,
    preferredTiers: ['balanced', 'heavy'],
    maxLatency: 5000,
    globalTimeout: 12000,
  },
  [AITask.CODE]: {
    temperature: 0.2,
    maxTokens: 1200,
    preferredTiers: ['code', 'balanced'],
    maxLatency: 6000,
    globalTimeout: 15000,
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// 3️⃣ MODEL TIER CLASSIFICATION
// Maps model patterns to performance tiers
// ─────────────────────────────────────────────────────────────────────────────

const MODEL_TIER_PATTERNS: Record<ModelTier, RegExp[]> = {
  fast: [
    /gemini.*flash/i,
    /phi-3/i,
    /gemma-3n/i,
    /mimo/i,
    /nano/i,
    /3b-instruct/i,
    /4b/i,
    /trinity-mini/i,
  ],
  balanced: [
    /mistral.*small/i,
    /mistral-7b/i,
    /gemma-3-12b/i,
    /gemma-3-27b/i,
    /qwen.*7b/i,
    /deepseek-chat/i,
    /devstral/i,
  ],
  heavy: [
    /70b/i,
    /72b/i,
    /405b/i,
    /think/i,
    /chimera/i,
    /120b/i,
    /kimi/i,
  ],
  code: [
    /coder/i,
    /devstral/i,
    /deepseek.*code/i,
    /qwen.*coder/i,
    /codellama/i,
  ],
}

function classifyModel(modelId: string): ModelTier {
  for (const [tier, patterns] of Object.entries(MODEL_TIER_PATTERNS)) {
    if (patterns.some(pattern => pattern.test(modelId))) {
      return tier as ModelTier
    }
  }
  return 'balanced' // default tier
}

// ─────────────────────────────────────────────────────────────────────────────
// 4️⃣ STATIC FALLBACK MODELS (Emergency Only)
// Organized by tier for task-aware routing
// ─────────────────────────────────────────────────────────────────────────────

const STATIC_FALLBACK_MODELS: Record<ModelTier, string[]> = {
  fast: [
    'google/gemini-2.0-flash-exp:free',
    'xiaomi/mimo-v2-flash:free',
    'nvidia/nemotron-nano-12b-v2-vl:free',
    'nvidia/nemotron-nano-9b-v2:free',
    'google/gemma-3n-e4b-it:free',
    'meta-llama/llama-3.2-3b-instruct:free',
    'qwen/qwen-3-4b:free',
    'arcee-ai/trinity-mini:free',
  ],
  balanced: [
    'mistral/devstral-2-2512:free',
    'deepseek/deepseek-chat:free',
    'mistralai/mistral-small-24b-instruct-2501:free',
    'qwen/qwen-2.5-vl-7b-instruct:free',
  ],
  heavy: [
    'qwen/qwen-2.5-72b-instruct:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'allenai/olmo-3.1-32b-think:free',
    'tngtech/deepseek-r1t2-chimera:free',
    'tngtech/deepseek-r1t-chimera:free',
    'moonshotai/kimi-k2:free',
    'openai/gpt-oss-20b:free',
    'openai/gpt-oss-120b:free',
    'nex-agi/deepseek-v3.1-nex-n1:free',
  ],
  code: [
    'qwen/qwen3-coder:free',
    'mistral/devstral-2-2512:free',
  ],
}

// ─────────────────────────────────────────────────────────────────────────────
// 5️⃣ MODEL CACHE (Edge-Safe, In-Memory)
// ─────────────────────────────────────────────────────────────────────────────

let cachedModels: Record<ModelTier, string[]> | null = null
let lastFetchTime = 0
const CACHE_TTL = 1000 * 60 * 30 // 30 minutes

// ─────────────────────────────────────────────────────────────────────────────
// 6️⃣ MODEL HEALTH MEMORY (Self-Healing)
// ─────────────────────────────────────────────────────────────────────────────

const modelFailures = new Map<string, number>()
const MAX_MODEL_FAILURES = 3

// ─────────────────────────────────────────────────────────────────────────────
// 7️⃣ TELEMETRY (Basic Logging)
// ─────────────────────────────────────────────────────────────────────────────

interface TelemetryEvent {
  task: AITask
  model: string
  tier: ModelTier
  latency: number
  success: boolean
  tokens?: number
  error?: string
}

function logTelemetry(event: TelemetryEvent): void {
  const emoji = event.success ? '✅' : '❌'
  console.log(
    `${emoji} [${event.task.toUpperCase()}] ${event.model} | ` +
    `tier=${event.tier} latency=${event.latency}ms success=${event.success}` +
    (event.error ? ` error="${event.error}"` : '')
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 8️⃣ FREE + TEXT-ONLY FILTER LOGIC
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
// 9️⃣ DYNAMIC MODEL FETCHER (Cached + Tiered)
// ─────────────────────────────────────────────────────────────────────────────

async function getModelsByTier(): Promise<Record<ModelTier, string[]>> {
  const now = Date.now()

  if (cachedModels && now - lastFetchTime < CACHE_TTL) {
    return cachedModels
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const res = await fetch(MODELS_ENDPOINT, {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!res.ok) throw new Error(`Models fetch failed: ${res.status}`)

    const data = await res.json()
    const models: OpenRouterModel[] = data?.data ?? []

    // Filter: free + text-capable
    const freeTextModels = models
      .filter(isFree)
      .filter(supportsText)

    // Classify into tiers
    const tieredModels: Record<ModelTier, string[]> = {
      fast: [],
      balanced: [],
      heavy: [],
      code: [],
    }

    for (const model of freeTextModels) {
      const modelId = model.id.endsWith(':free') ? model.id : `${model.id}:free`
      const tier = classifyModel(model.id)
      tieredModels[tier].push(modelId)
    }

    // Sort each tier by context length (smaller = faster first)
    for (const tier of Object.keys(tieredModels) as ModelTier[]) {
      tieredModels[tier].sort()
    }

    cachedModels = tieredModels
    lastFetchTime = now

    const totalCount = Object.values(tieredModels).flat().length
    console.log(`📡 Loaded ${totalCount} free models across ${Object.keys(tieredModels).length} tiers`)

    return tieredModels
  } catch (err) {
    console.warn('⚠️ Falling back to static models:', (err as Error).message)
    return STATIC_FALLBACK_MODELS
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 🔟 TASK-AWARE MODEL SELECTOR
// Returns models ordered by task preference
// ─────────────────────────────────────────────────────────────────────────────

async function getModelsForTask(task: AITask): Promise<string[]> {
  const policy = TASK_POLICIES[task]
  const tieredModels = await getModelsByTier()

  const orderedModels: string[] = []

  // Add models from preferred tiers first
  for (const tier of policy.preferredTiers) {
    orderedModels.push(...(tieredModels[tier] || []))
  }

  // Add remaining tiers as fallback
  for (const tier of ['fast', 'balanced', 'heavy', 'code'] as ModelTier[]) {
    if (!policy.preferredTiers.includes(tier)) {
      orderedModels.push(...(tieredModels[tier] || []))
    }
  }

  // De-duplicate while preserving order
  return [...new Set(orderedModels)]
}

// ─────────────────────────────────────────────────────────────────────────────
// 1️⃣1️⃣ CORE OPENROUTER CALLER (Task-Aware)
// ─────────────────────────────────────────────────────────────────────────────

async function callOpenRouter(
  messages: ChatMessage[],
  task: AITask = AITask.ANSWER
): Promise<string | null> {
  if (!OPENROUTER_API_KEY) {
    console.warn('⚠️ OPENROUTER_API_KEY missing')
    return null
  }

  const policy = TASK_POLICIES[task]
  const models = await getModelsForTask(task)

  const startTime = Date.now()

  for (const model of models) {
    // Skip unhealthy models
    if ((modelFailures.get(model) || 0) >= MAX_MODEL_FAILURES) {
      continue
    }

    // Check global timeout
    if (Date.now() - startTime > policy.globalTimeout) {
      console.warn(`⏱️ Global timeout (${policy.globalTimeout}ms) for task: ${task}`)
      return null
    }

    const modelStartTime = Date.now()
    const tier = classifyModel(model)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), policy.maxLatency)

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
            temperature: policy.temperature,
            max_tokens: policy.maxTokens,
            top_p: 1,
          }),
          signal: controller.signal,
        }
      )

      clearTimeout(timeoutId)
      const latency = Date.now() - modelStartTime

      // Retry-worthy transient errors
      if ([429, 500, 502, 503].includes(response.status)) {
        logTelemetry({ task, model, tier, latency, success: false, error: `HTTP ${response.status}` })
        await new Promise(r => setTimeout(r, 300))
        continue
      }

      // Non-transient failure
      if (!response.ok) {
        modelFailures.set(model, (modelFailures.get(model) || 0) + 1)
        logTelemetry({ task, model, tier, latency, success: false, error: `HTTP ${response.status}` })
        continue
      }

      const data = await response.json()
      const content = data?.choices?.[0]?.message?.content
      const tokens = data?.usage?.total_tokens

      if (content) {
        logTelemetry({ task, model, tier, latency, success: true, tokens })
        return content
      }

      logTelemetry({ task, model, tier, latency, success: false, error: 'Empty response' })
    } catch (err: unknown) {
      clearTimeout(timeoutId)
      const error = err as Error
      const latency = Date.now() - modelStartTime

      if (error.name === 'AbortError') {
        logTelemetry({ task, model, tier, latency, success: false, error: 'Timeout' })
      } else {
        modelFailures.set(model, (modelFailures.get(model) || 0) + 1)
        logTelemetry({ task, model, tier, latency, success: false, error: error.message })
      }
    }
  }

  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// 1️⃣2️⃣ HARDENED JSON EXTRACTION UTILITY
// ─────────────────────────────────────────────────────────────────────────────

function extractJsonArray(text: string): string | null {
  const match = text.match(/\[\s*"[\s\S]*?"\s*\]/)
  return match ? match[0] : null
}

// ─────────────────────────────────────────────────────────────────────────────
// 1️⃣3️⃣ SEARCH SUGGESTIONS (Task-Aware)
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

  const content = await callOpenRouter(messages, AITask.SUGGESTIONS)
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
// 1️⃣4️⃣ ANSWER GENERATION (Task-Aware)
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

  const content = await callOpenRouter(messages, AITask.ANSWER)
  const validated = answerResponseSchema.safeParse({ answer: content || '' })

  return validated.success ? validated.data.answer : 'AI summary unavailable.'
}

// ─────────────────────────────────────────────────────────────────────────────
// 1️⃣5️⃣ CODE GENERATION (New Task-Aware Function)
// ─────────────────────────────────────────────────────────────────────────────

export async function generateCode(
  prompt: string,
  language?: string
): Promise<string> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are a precise code generator. Output clean, working ${language || 'code'} only. No explanations unless asked. Use markdown code blocks.`,
    },
    {
      role: 'user',
      content: prompt,
    },
  ]

  const content = await callOpenRouter(messages, AITask.CODE)
  return content || '// Code generation unavailable'
}

// ─────────────────────────────────────────────────────────────────────────────
// 1️⃣6️⃣ FALLBACK GENERATOR
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
