import { z } from 'zod'

/**
 * Environment Variables Validation Schema
 */
const envSchema = z.object({
  OPENROUTER_API_KEY: z.string().min(1, 'OPENROUTER_API_KEY is required'),
  GOOGLE_SEARCH_API_KEY: z.string().optional(),
  GOOGLE_SEARCH_CX: z.string().optional(),
  SERPAPI_KEY: z.string().optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
})

// Validate environment variables
const env = envSchema.safeParse({
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  GOOGLE_SEARCH_API_KEY: process.env.GOOGLE_SEARCH_API_KEY,
  GOOGLE_SEARCH_CX: process.env.GOOGLE_SEARCH_CX,
  SERPAPI_KEY: process.env.SERPAPI_KEY,
  NODE_ENV: process.env.NODE_ENV,
})

if (!env.success) {
  console.error('❌ Invalid environment variables:', env.error.flatten().fieldErrors)
  // Don't throw during build — env vars are injected at runtime on Vercel edge
}

export const ENV = env.success ? env.data : ({} as z.infer<typeof envSchema>)
