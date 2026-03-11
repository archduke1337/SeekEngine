/**
 * OpenRouter Model Management
 * Model classification, health tracking, fetching, and task-aware selection
 */

import type { ModelTier, OpenRouterModel, AITask, TelemetryEvent } from './types'
import {
  MODEL_TIER_PATTERNS,
  MODELS_ENDPOINT,
  STATIC_FALLBACK_MODELS,
  CACHE_TTL,
  MAX_MODEL_FAILURES,
  TASK_POLICIES,
} from './config'

// ── Human-Friendly Model Name Mapper ─────────────────────────────────────────

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

// ── Model Tier Classification ────────────────────────────────────────────────

export function classifyModel(modelId: string): ModelTier {
  const id = modelId.replace(/:free$/, '').toLowerCase()
  
  if (MODEL_TIER_PATTERNS.code.some(p => p.test(id))) return 'code'
  if (MODEL_TIER_PATTERNS.fast.some(p => p.test(id))) return 'fast'
  if (MODEL_TIER_PATTERNS.balanced.some(p => p.test(id))) return 'balanced'
  if (MODEL_TIER_PATTERNS.heavy.some(p => p.test(id))) return 'heavy'
  
  return 'balanced'
}

// ── Filter Logic ─────────────────────────────────────────────────────────────

function isFree(model: OpenRouterModel): boolean {
  const pricing = model.pricing
  if (!pricing) return false
  const prompt = Number(pricing.prompt)
  const completion = Number(pricing.completion)
  return prompt === 0 && completion === 0
}

function supportsText(model: OpenRouterModel): boolean {
  return model.architecture?.output_modalities?.includes('text') ?? false
}

// ── Model Health Memory ──────────────────────────────────────────────────────

export const modelFailures = new Map<string, number>()

// ── Telemetry ────────────────────────────────────────────────────────────────

export function logTelemetry(event: TelemetryEvent): void {
  const emoji = event.success ? '✅' : '❌'
  console.log(
    `${emoji} [${event.task.toUpperCase()}] ${event.model} | ` +
    `tier=${event.tier} latency=${event.latency}ms success=${event.success}` +
    (event.error ? ` error="${event.error}"` : '')
  )
}

// ── Model Cache (Edge-Safe, In-Memory) ───────────────────────────────────────

let cachedModels: Record<ModelTier, string[]> | null = null
let lastFetchTime = 0

export async function getModelsByTier(): Promise<Record<ModelTier, string[]>> {
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

// ── Task-Aware Model Selector ────────────────────────────────────────────────

export async function getModelsForTask(task: AITask): Promise<string[]> {
  const policy = TASK_POLICIES[task]
  const tieredModels = await getModelsByTier()

  const orderedModels: string[] = []

  for (const tier of policy.preferredTiers) {
    orderedModels.push(...(tieredModels[tier] || []))
  }

  for (const tier of ['fast', 'balanced', 'heavy', 'code'] as ModelTier[]) {
    if (!policy.preferredTiers.includes(tier)) {
      orderedModels.push(...(tieredModels[tier] || []))
    }
  }

  const uniqueModels = [...new Set(orderedModels)]
  
  uniqueModels.sort((a, b) => {
    const failuresA = modelFailures.get(a) || 0
    const failuresB = modelFailures.get(b) || 0
    return (failuresA - failuresB) || (Math.random() - 0.5)
  })

  return uniqueModels
}
