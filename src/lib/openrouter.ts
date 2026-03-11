/**
 * OpenRouter AI Integration (V5 - Observable AI)
 * 
 * Features:
 * - Returns which model actually answered (transparency)
 * - Task-aware model routing (suggestions vs answers vs code)
 * - Policy-driven temperature and token limits
 * - Model tier classification (fast → balanced → heavy → code)
 * - Dynamic model fetching with caching
 * - Self-healing model health memory
 * - Telemetry logging with latency tracking
 * - Human-friendly model name mapper
 * - ZOD validation boundaries
 */

import { suggestionsResponseSchema, answerResponseSchema } from './validation'
import { ENV } from './env'

// ─────────────────────────────────────────────────────────────────────────────
// 1️⃣ CONSTANTS & TYPES
// ─────────────────────────────────────────────────────────────────────────────

const OPENROUTER_API_KEY = ENV.OPENROUTER_API_KEY
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'
const MODELS_ENDPOINT = 'https://openrouter.ai/api/v1/models'

// Debug API Key presence (safe log — development only)
if (process.env.NODE_ENV === 'development') {
  console.log(`🔑 OpenRouter API Key Present: ${!!OPENROUTER_API_KEY}`)
}


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

// Observable AI result - exposes which model answered
type AIResult = {
  content: string
  model: string
  modelHuman: string
  latencyMs: number
  tier: ModelTier
  attempts: number // How many models were tried before success
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
  maxLatency: number
  globalTimeout: number
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
    preferredTiers: ['fast', 'balanced', 'heavy'],
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
// 3️⃣ HUMAN-FRIENDLY MODEL NAME MAPPER
// ─────────────────────────────────────────────────────────────────────────────

export function humanizeModel(model: string): string {
  const lower = model.toLowerCase()
  
  // Google models
  if (lower.includes('gemini-2.0-flash')) return 'Gemini 2.0 Flash'
  if (lower.includes('gemini')) return 'Gemini'
  if (lower.includes('gemma-3n')) return 'Gemma 3N'
  if (lower.includes('gemma-3-27b')) return 'Gemma 3 27B'
  if (lower.includes('gemma-3-12b')) return 'Gemma 3 12B'
  if (lower.includes('gemma')) return 'Gemma'
  
  // Meta models
  if (lower.includes('llama-3.3-70b')) return 'LLaMA 3.3 70B'
  if (lower.includes('llama-3.2-3b')) return 'LLaMA 3.2 3B'
  if (lower.includes('llama-3.1-405b')) return 'LLaMA 3.1 405B'
  if (lower.includes('llama')) return 'LLaMA'
  
  // Mistral models
  if (lower.includes('devstral')) return 'Devstral'
  if (lower.includes('mistral-small')) return 'Mistral Small'
  if (lower.includes('mistral-7b')) return 'Mistral 7B'
  if (lower.includes('mistral')) return 'Mistral'
  
  // Qwen models
  if (lower.includes('qwen3-coder')) return 'Qwen3 Coder'
  if (lower.includes('qwen-2.5-72b')) return 'Qwen 2.5 72B'
  if (lower.includes('qwen-2.5-vl')) return 'Qwen 2.5 VL'
  if (lower.includes('qwen-3-4b')) return 'Qwen 3 4B'
  if (lower.includes('qwen')) return 'Qwen'
  
  // DeepSeek models
  if (lower.includes('deepseek-r1')) return 'DeepSeek R1'
  if (lower.includes('deepseek-chat')) return 'DeepSeek Chat'
  if (lower.includes('deepseek')) return 'DeepSeek'
  
  // NVIDIA models
  if (lower.includes('nemotron-nano')) return 'Nemotron Nano'
  if (lower.includes('nemotron')) return 'Nemotron'
  
  // Other notable models
  if (lower.includes('phi-3')) return 'Phi-3'
  if (lower.includes('olmo')) return 'OLMo'
  if (lower.includes('mimo')) return 'MiMo'
  if (lower.includes('kimi')) return 'Kimi K2'
  if (lower.includes('hermes')) return 'Hermes'
  if (lower.includes('trinity')) return 'Trinity'
  if (lower.includes('gpt-oss')) return 'GPT-OSS'
  if (lower.includes('chimera')) return 'Chimera'
  
  // Fallback: extract provider/model name
  const parts = model.split('/')
  if (parts.length === 2) {
    return parts[1].replace(/:free$/, '').replace(/-/g, ' ')
  }
  
  return model
}

// ─────────────────────────────────────────────────────────────────────────────
// 4️⃣ MODEL TIER CLASSIFICATION
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
  // Strip :free suffix for consistent matching
  const id = modelId.replace(/:free$/, '').toLowerCase()
  
  // Prioritize code tier explicitly to prevent dual-classification
  if (MODEL_TIER_PATTERNS.code.some(p => p.test(id))) return 'code'
  if (MODEL_TIER_PATTERNS.fast.some(p => p.test(id))) return 'fast'
  if (MODEL_TIER_PATTERNS.balanced.some(p => p.test(id))) return 'balanced'
  if (MODEL_TIER_PATTERNS.heavy.some(p => p.test(id))) return 'heavy'
  
  return 'balanced'
}

// ─────────────────────────────────────────────────────────────────────────────
// 5️⃣ STATIC FALLBACK MODELS (Emergency Only)
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
// 6️⃣ MODEL CACHE (Edge-Safe, In-Memory)
// ─────────────────────────────────────────────────────────────────────────────

let cachedModels: Record<ModelTier, string[]> | null = null
let lastFetchTime = 0
const CACHE_TTL = 1000 * 60 * 30 // 30 minutes

// ─────────────────────────────────────────────────────────────────────────────
// 7️⃣ MODEL HEALTH MEMORY (Self-Healing)
// ─────────────────────────────────────────────────────────────────────────────

const modelFailures = new Map<string, number>()
const MAX_MODEL_FAILURES = 3

// ─────────────────────────────────────────────────────────────────────────────
// 8️⃣ TELEMETRY (Basic Logging)
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
// 9️⃣ FREE + TEXT-ONLY FILTER LOGIC
// ─────────────────────────────────────────────────────────────────────────────

function isFree(model: OpenRouterModel): boolean {
  const pricing = model.pricing
  if (!pricing) return false
  
  // Handle both number and string '0'
  const prompt = Number(pricing.prompt)
  const completion = Number(pricing.completion)
  
  return prompt === 0 && completion === 0
}

function supportsText(model: OpenRouterModel): boolean {
  return model.architecture?.output_modalities?.includes('text') ?? false
}

// ─────────────────────────────────────────────────────────────────────────────
// 🔟 DYNAMIC MODEL FETCHER (Cached + Tiered)
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
    console.log(`🌐 Fetched ${models.length} raw models from OpenRouter`)

    const freeTextModels = models.filter(isFree).filter(supportsText)
    console.log(`🆓 Found ${freeTextModels.length} free text-capable models`)

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

    // Shuffle models within each tier using Fisher-Yates for unbiased distribution
    for (const tier of Object.keys(tieredModels) as ModelTier[]) {
      const arr = tieredModels[tier]
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]]
      }
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
// 1️⃣1️⃣ TASK-AWARE MODEL SELECTOR
// ─────────────────────────────────────────────────────────────────────────────

async function getModelsForTask(task: AITask): Promise<string[]> {
  const policy = TASK_POLICIES[task]
  const tieredModels = await getModelsByTier()

  const orderedModels: string[] = []

  // Add preferred tiers first
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
  const uniqueModels = [...new Set(orderedModels)]
  
  // Sort by health: healthy models float up, sick models sink
  uniqueModels.sort((a, b) => {
    const failuresA = modelFailures.get(a) || 0
    const failuresB = modelFailures.get(b) || 0
    return (failuresA - failuresB) || (Math.random() - 0.5)
  })

  return uniqueModels
}

// ─────────────────────────────────────────────────────────────────────────────
// 1️⃣2️⃣ CORE OPENROUTER CALLER (Observable - Returns Model Info)
// ─────────────────────────────────────────────────────────────────────────────

async function callOpenRouter(
  messages: ChatMessage[],
  task: AITask = AITask.ANSWER
): Promise<AIResult | null> {
  // Check key at runtime (Edge compatible)
  const apiKey = ENV.OPENROUTER_API_KEY
  if (!apiKey) {
    console.warn('⚠️ OPENROUTER_API_KEY missing - check .env.local')
    return null
  }
  console.log('🔑 API Key validated')

  const policy = TASK_POLICIES[task]
  const allModels = await getModelsForTask(task)
  
  // Filter out models with too many failures
  let models = allModels.filter(m => (modelFailures.get(m) || 0) < MAX_MODEL_FAILURES)
  
  if (models.length === 0) {
    console.warn(`⚠️ All models failed for ${task}. Resetting failures.`)
    modelFailures.clear()
    models = allModels
  }

  const startTime = Date.now()
  let attempts = 0

  for (const model of models) {
    attempts++

    if (Date.now() - startTime > policy.globalTimeout) {
      console.warn(`⏱️ Global timeout (${policy.globalTimeout}ms) for task: ${task}`)
      return null
    }

    console.log(`🤖 Attempt ${attempts}: Trying ${humanizeModel(model)} (${model}) [Tier: ${classifyModel(model)}]`)

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
            Authorization: `Bearer ${apiKey}`,
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

      if ([429, 500, 502, 503].includes(response.status)) {
        console.warn(`⚠️ Transient error ${response.status} for ${model}`)
        logTelemetry({ task, model, tier, latency, success: false, error: `HTTP ${response.status}` })
        await new Promise(r => setTimeout(r, 300))
        continue
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error')
        console.error(`❌ Model ${model} failed with ${response.status}: ${errorText}`)
        modelFailures.set(model, (modelFailures.get(model) || 0) + 1)
        logTelemetry({ task, model, tier, latency, success: false, error: `HTTP ${response.status}` })
        continue
      }

      const data = await response.json()

      const content = data?.choices?.[0]?.message?.content
      const tokens = data?.usage?.total_tokens

      if (content) {
        logTelemetry({ task, model, tier, latency, success: true, tokens })
        
        // LOG THE GENERATED RESPONSE (Sample)
        console.log(`📝 [GENERATED] ${model} (${tier}): "${content.slice(0, 100).replace(/\n/g, ' ')}..."`)

        return {
          content,
          model,
          modelHuman: humanizeModel(model),
          latencyMs: latency,
          tier,
          attempts,
        }
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

  console.error('❌ All models failed for this request.')
  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// 1️⃣3️⃣ STREAMING AI CALLER (SSE-Compatible)
// Yields tokens as they arrive for perceived instant responses
// ─────────────────────────────────────────────────────────────────────────────

export interface StreamEvent {
  type: 'token' | 'thinking' | 'done' | 'error' | 'model_selected'
  content?: string
  model?: string
  modelHuman?: string
  tier?: ModelTier
  latencyMs?: number
  attempts?: number
  error?: string
}

export async function* streamOpenRouter(
  messages: ChatMessage[],
  task: AITask = AITask.ANSWER
): AsyncGenerator<StreamEvent> {
  const apiKey = ENV.OPENROUTER_API_KEY
  if (!apiKey) {
    yield { type: 'error', error: 'OPENROUTER_API_KEY missing' }
    return
  }
  console.log('🔑 Streaming API Key validated')

  const policy = TASK_POLICIES[task]
  const allModels = await getModelsForTask(task)
  // Filter out models with too many failures
  let models = allModels.filter(m => (modelFailures.get(m) || 0) < MAX_MODEL_FAILURES)
  
  if (models.length === 0) {
    console.warn('⚠️ All models marked as failed. Resetting failures and retrying.')
    modelFailures.clear()
    models = allModels
  }
  
  if (models.length === 0) {
    yield { type: 'error', error: 'No models available' }
    return
  }
  
  const startTime = Date.now()
  let attempts = 0

  // Emit thinking state
  yield { type: 'thinking', content: 'Connecting to AI...' }

  // Helper: Race a single model to first token (Strict 800ms TTFT)
  const connectToModel = async (model: string, externalController?: AbortController): Promise<{
    model: string,
    reader: ReadableStreamDefaultReader<Uint8Array>,
    decoder: TextDecoder,
    remainingBuffer: string,
    firstToken: string | null
    latency: number
    controller: AbortController
    tier: ModelTier
  }> => {
    const tier = classifyModel(model.replace(/:free$/, ''))
    const controller = externalController || new AbortController()
    const modelStartTime = Date.now()

    try {
      const response = await fetch(
        `${OPENROUTER_BASE_URL}/chat/completions`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
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
            stream: true,
          }),
          signal: controller.signal,
        }
      )

      if (!response.ok || !response.body) {
         modelFailures.set(model, (modelFailures.get(model) || 0) + 1)
         throw new Error(`HTTP ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      
      
      // STRICT TTFT CHECK: Tier-aware timeouts
      // Relaxed significantly (15s global) to fix instability
      const limit = tier === 'fast' ? 2000 : 5000
      const ttftTimeout = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('TTFT_TIMEOUT')), limit)
      )

      const readFirstChunk = async () => {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i]
            const trimmed = line.trim()
            if (!trimmed || trimmed === 'data: [DONE]') continue
            if (!trimmed.startsWith('data: ')) continue

            try {
              // OPTIMIZATION: Scan for content before expensive JSON.parse
              if (!trimmed.includes('"content":')) continue

              const json = JSON.parse(trimmed.slice(6))
              const delta = json.choices?.[0]?.delta?.content
              if (delta) {
                 // CRITICAL FIX: Reconstruct buffer with unprocessed lines
                 // If we return now, we must save lines[i+1...end]
                 const remainingLines = lines.slice(i + 1)
                 if (remainingLines.length > 0) {
                   buffer = remainingLines.join('\n') + (buffer ? '\n' + buffer : '')
                 }
                 return delta // Found first token!
              }
            } catch { }
          }
        }
        throw new Error('No token found')
      }

      // Race reading against timeout
      const firstToken = await Promise.race([readFirstChunk(), ttftTimeout])

      return {
        model,
        reader,
        decoder,
        remainingBuffer: buffer,
        firstToken,
        latency: Date.now() - modelStartTime,
        controller,
        tier
      }

    } catch (err) {
      // Update failure count
      modelFailures.set(model, (modelFailures.get(model) || 0) + 1)
      
      if ((err as Error).message === 'TTFT_TIMEOUT') {
        console.warn(`⏳ TTFT Timeout for ${model}`)
      }
      controller.abort() // Ensure cleanup
      throw err
    }
  }

  // RACE LOOP: Process models in batches of 2
  for (let i = 0; i < models.length; i += 2) {
    const batch = models.slice(i, i + 2)
    attempts += batch.length
    
    // Create abort controllers upfront so we can always clean up
    const batchControllers = new Map<string, AbortController>()
    // Pre-create controllers so they're available for cleanup even if promise hasn't resolved
    for (const m of batch) {
      batchControllers.set(m, new AbortController())
    }
    
    try {
      const promises = batch.map(m => {
        return connectToModel(m, batchControllers.get(m)!)
      })

      // Wait for FIRST successful connection with token
      const winner = await Promise.any(promises)

      // Abort all other connections in this batch
      for (const [model, controller] of batchControllers) {
        if (model !== winner.model) {
          controller.abort()
        }
      }

      // Also abort any models whose .then() hasn't fired yet
      // by waiting a tick and cleaning up stragglers
      setTimeout(() => {
        for (const [model, controller] of batchControllers) {
          if (model !== winner.model) {
            controller.abort()
          }
        }
      }, 100)

      // Emit selection info
      yield { 
        type: 'model_selected', 
        model: winner.model, 
        modelHuman: humanizeModel(winner.model),
        tier: winner.tier,
        attempts 
      }

      // Yield the first token we already captured
      if (winner.firstToken) {
        yield { type: 'token', content: winner.firstToken }
      }

      // Continue streaming the winner normally
      const { reader, decoder } = winner
      let buffer = winner.remainingBuffer
      let fullContent = winner.firstToken || ''

      // Unified chunk processor to prevent logic duplication
      const processChunk = function* (chunk: string): Generator<StreamEvent, void, unknown> {
          buffer += chunk
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed || trimmed === 'data: [DONE]') continue
            if (!trimmed.startsWith('data: ')) continue

            try {
              if (!trimmed.includes('"content":')) continue
              const json = JSON.parse(trimmed.slice(6))
              const delta = json.choices?.[0]?.delta?.content
              
              if (delta) {
                fullContent += delta
                yield { type: 'token', content: delta }
              }
            } catch { }
          }
      }

      try {
        // 1. Process initial buffer (gathered during connection race)
        if (buffer) {
           const initial = buffer
           buffer = '' // Reset, let processChunk rebuild it
           for (const event of processChunk(initial)) yield event
        }

        // 2. Process incoming stream
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value, { stream: true })
          for (const event of processChunk(chunk)) yield event
        }
      } finally {
        // Ensure request is aborted if we exit early (e.g. client disconnect)
        try {
          await reader.cancel()
          winner.controller.abort() 
        } catch {}
      }

      // Success - emit done and exit
      // Update telemetry
      logTelemetry({ task, model: winner.model, tier: winner.tier, latency: winner.latency, success: true })
      
      // LOG THE GENERATED RESPONSE (Full preview for verification)
      const preview = fullContent.length > 300 
        ? fullContent.slice(0, 300) + '...' 
        : fullContent
      console.log(`📝 [GENERATED] ${winner.model}:\n"${preview.replace(/\n/g, ' ')}"`)

      yield {
        type: 'done',
        content: fullContent,
        model: winner.model,
        modelHuman: humanizeModel(winner.model),
        tier: winner.tier,
        latencyMs: winner.latency,
        attempts
      }
      return

    } catch (e) {
      // Both failed, abort all controllers in this batch and continue
       for (const controller of batchControllers.values()) {
         controller.abort()
       }
    }
    
    if (Date.now() - startTime > policy.globalTimeout) {
       yield { type: 'error', error: 'Global timeout reached' }
       return
    }
  }

  yield { type: 'error', error: 'All models failed' }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1️⃣4️⃣ STREAMING ANSWER GENERATOR (For API Routes)
// Returns a ReadableStream for SSE responses
// ─────────────────────────────────────────────────────────────────────────────

const BASE_SYSTEM_PROMPT = "You are SeekEngine AI. Concise markdown. Cite sources as [n]."

export function createStreamingAnswerResponse(
  query: string,
  context?: { title: string; snippet: string }[],
  abortSignal?: AbortSignal
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()

  const contextText =
    context
      ?.map((r, i) => `[${i + 1}] "${r.title}": ${r.snippet}`)
      .join('\n') || ''

  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: contextText 
        ? `${BASE_SYSTEM_PROMPT}\n\nSource base:\n${contextText}` 
        : BASE_SYSTEM_PROMPT,
    },
    {
      role: 'user',
      content: query,
    },
  ]

  let isCancelled = false

  return new ReadableStream({
    async start(controller) {
      // Listen for client disconnect
      abortSignal?.addEventListener('abort', () => {
        isCancelled = true
        try {
          controller.close()
        } catch {
          // Already closed
        }
      })

      try {
        for await (const event of streamOpenRouter(messages, AITask.ANSWER)) {
          // Check if cancelled before each emit
          if (isCancelled) break
          
          const data = `data: ${JSON.stringify(event)}\n\n`
          controller.enqueue(encoder.encode(data))
        }
        if (!isCancelled) {
          controller.close()
        }
      } catch (error) {
        if (!isCancelled) {
          const errorEvent = { type: 'error', error: (error as Error).message }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`))
          controller.close()
        }
      }
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// 1️⃣5️⃣ HARDENED JSON EXTRACTION UTILITY
// ─────────────────────────────────────────────────────────────────────────────

function extractJsonArray(text: string): string | null {
  const match = text.match(/\[\s*"[\s\S]*?"\s*\]/)
  return match ? match[0] : null
}

// ─────────────────────────────────────────────────────────────────────────────
// 1️⃣4️⃣ SEARCH SUGGESTIONS (Observable)
// ─────────────────────────────────────────────────────────────────────────────

export interface SuggestionsResult {
  suggestions: string[]
  model: string
  modelHuman: string
  latencyMs: number
  attempts: number
}

export async function getSearchSuggestions(query: string): Promise<SuggestionsResult> {
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

  const result = await callOpenRouter(messages, AITask.SUGGESTIONS)

  if (!result) {
    return {
      suggestions: generateFallbackSuggestions(query),
      model: 'fallback',
      modelHuman: 'Fallback',
      latencyMs: 0,
      attempts: 0,
    }
  }

  try {
    const json = extractJsonArray(result.content)
    if (!json) throw new Error('No JSON array found')

    const parsed = JSON.parse(json)
    const validated = suggestionsResponseSchema.safeParse({ suggestions: parsed })

    return {
      suggestions: validated.success
        ? validated.data.suggestions.slice(0, 5)
        : generateFallbackSuggestions(query),
      model: result.model,
      modelHuman: result.modelHuman,
      latencyMs: result.latencyMs,
      attempts: result.attempts,
    }
  } catch {
    return {
      suggestions: generateFallbackSuggestions(query),
      model: result.model,
      modelHuman: result.modelHuman,
      latencyMs: result.latencyMs,
      attempts: result.attempts,
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1️⃣5️⃣ ANSWER GENERATION (Observable)
// ─────────────────────────────────────────────────────────────────────────────

export interface AnswerResult {
  answer: string
  model: string
  modelHuman: string
  latencyMs: number
  tier: ModelTier
  attempts: number
}

export async function generateAIAnswer(
  query: string,
  context?: { title: string; snippet: string }[]
): Promise<AnswerResult> {
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

  const result = await callOpenRouter(messages, AITask.ANSWER)

  if (!result) {
    return {
      answer: 'AI summary unavailable.',
      model: 'none',
      modelHuman: 'Unavailable',
      latencyMs: 0,
      tier: 'balanced',
      attempts: 0,
    }
  }

  const validated = answerResponseSchema.safeParse({ answer: result.content })

  return {
    answer: validated.success ? validated.data.answer : 'AI summary unavailable.',
    model: result.model,
    modelHuman: result.modelHuman,
    latencyMs: result.latencyMs,
    tier: result.tier,
    attempts: result.attempts,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1️⃣6️⃣ CODE GENERATION (Observable)
// ─────────────────────────────────────────────────────────────────────────────

export interface CodeResult {
  code: string
  model: string
  modelHuman: string
  latencyMs: number
  attempts: number
}

export async function generateCode(
  prompt: string,
  language?: string
): Promise<CodeResult> {
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

  const result = await callOpenRouter(messages, AITask.CODE)

  if (!result) {
    return {
      code: '// Code generation unavailable',
      model: 'none',
      modelHuman: 'Unavailable',
      latencyMs: 0,
      attempts: 0,
    }
  }

  return {
    code: result.content,
    model: result.model,
    modelHuman: result.modelHuman,
    latencyMs: result.latencyMs,
    attempts: result.attempts,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1️⃣7️⃣ FALLBACK GENERATOR
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
