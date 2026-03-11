/**
 * OpenRouter AI Configuration
 * Constants, policies, and static fallback models
 */

import { ENV } from '../env'
import type { AITask, TaskPolicy, ModelTier } from './types'
import { AITask as AITaskEnum } from './types'

export const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'
export const MODELS_ENDPOINT = 'https://openrouter.ai/api/v1/models'
export const MAX_MODEL_FAILURES = 3
export const CACHE_TTL = 1000 * 60 * 30 // 30 minutes

export const BASE_SYSTEM_PROMPT = "You are SeekEngine AI. Concise markdown. Cite sources as [n]."

// Debug API Key presence (safe log — development only)
if (process.env.NODE_ENV === 'development') {
  console.log(`🔑 OpenRouter API Key Present: ${!!ENV.OPENROUTER_API_KEY}`)
}

export const TASK_POLICIES: Record<AITask, TaskPolicy> = {
  [AITaskEnum.SUGGESTIONS]: {
    temperature: 0.8,
    maxTokens: 200,
    preferredTiers: ['fast', 'balanced'],
    maxLatency: 3000,
    globalTimeout: 6000,
  },
  [AITaskEnum.ANSWER]: {
    temperature: 0.35,
    maxTokens: 800,
    preferredTiers: ['fast', 'balanced', 'heavy'],
    maxLatency: 5000,
    globalTimeout: 12000,
  },
  [AITaskEnum.CODE]: {
    temperature: 0.2,
    maxTokens: 1200,
    preferredTiers: ['code', 'balanced'],
    maxLatency: 6000,
    globalTimeout: 15000,
  },
}

export const MODEL_TIER_PATTERNS: Record<ModelTier, RegExp[]> = {
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

export const STATIC_FALLBACK_MODELS: Record<ModelTier, string[]> = {
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
