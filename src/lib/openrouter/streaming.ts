/**
 * OpenRouter Streaming
 * SSE-compatible streaming AI caller with model racing
 */

import { ENV } from '../env'
import type { ChatMessage, AITask, ModelTier, StreamEvent } from './types'
import { AITask as AITaskEnum } from './types'
import { OPENROUTER_BASE_URL, TASK_POLICIES, MAX_MODEL_FAILURES, BASE_SYSTEM_PROMPT } from './config'
import { humanizeModel, classifyModel, modelFailures, logTelemetry, getModelsForTask } from './models'

// ── Streaming AI Caller (SSE-Compatible) ─────────────────────────────────────

export async function* streamOpenRouter(
  messages: ChatMessage[],
  task: AITask = AITaskEnum.ANSWER
): AsyncGenerator<StreamEvent> {
  const apiKey = ENV.OPENROUTER_API_KEY
  if (!apiKey) {
    yield { type: 'error', error: 'OPENROUTER_API_KEY missing' }
    return
  }
  console.log('🔑 Streaming API Key validated')

  const policy = TASK_POLICIES[task]
  const allModels = await getModelsForTask(task)
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

  yield { type: 'thinking', content: 'Connecting to AI...' }

  // Helper: Race a single model to first token
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
      
      // Tier-aware TTFT timeouts
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
              if (!trimmed.includes('"content":')) continue

              const json = JSON.parse(trimmed.slice(6))
              const delta = json.choices?.[0]?.delta?.content
              if (delta) {
                 const remainingLines = lines.slice(i + 1)
                 if (remainingLines.length > 0) {
                   buffer = remainingLines.join('\n') + (buffer ? '\n' + buffer : '')
                 }
                 return delta
              }
            } catch { }
          }
        }
        throw new Error('No token found')
      }

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
      modelFailures.set(model, (modelFailures.get(model) || 0) + 1)
      
      if ((err as Error).message === 'TTFT_TIMEOUT') {
        console.warn(`⏳ TTFT Timeout for ${model}`)
      }
      controller.abort()
      throw err
    }
  }

  // Process models in batches of 2
  for (let i = 0; i < models.length; i += 2) {
    const batch = models.slice(i, i + 2)
    attempts += batch.length
    
    const batchControllers = new Map<string, AbortController>()
    for (const m of batch) {
      batchControllers.set(m, new AbortController())
    }
    
    try {
      const promises = batch.map(m => {
        return connectToModel(m, batchControllers.get(m)!)
      })

      const winner = await Promise.any(promises)

      for (const [model, controller] of batchControllers) {
        if (model !== winner.model) {
          controller.abort()
        }
      }

      setTimeout(() => {
        for (const [model, controller] of batchControllers) {
          if (model !== winner.model) {
            controller.abort()
          }
        }
      }, 100)

      yield { 
        type: 'model_selected', 
        model: winner.model, 
        modelHuman: humanizeModel(winner.model),
        tier: winner.tier,
        attempts 
      }

      if (winner.firstToken) {
        yield { type: 'token', content: winner.firstToken }
      }

      const { reader, decoder } = winner
      let buffer = winner.remainingBuffer
      let fullContent = winner.firstToken || ''

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
        if (buffer) {
           const initial = buffer
           buffer = ''
           for (const event of processChunk(initial)) yield event
        }

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value, { stream: true })
          for (const event of processChunk(chunk)) yield event
        }
      } finally {
        try {
          await reader.cancel()
          winner.controller.abort() 
        } catch {}
      }

      logTelemetry({ task, model: winner.model, tier: winner.tier, latency: winner.latency, success: true })
      
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

// ── Streaming Answer Response (For API Routes) ──────────────────────────────

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
      abortSignal?.addEventListener('abort', () => {
        isCancelled = true
        try {
          controller.close()
        } catch {
          // Already closed
        }
      })

      try {
        for await (const event of streamOpenRouter(messages, AITaskEnum.ANSWER)) {
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
