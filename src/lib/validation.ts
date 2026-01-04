/**
 * API Validation Schemas
 * Zod schemas for validating API requests and responses
 */

import { z } from 'zod'

// Search query validation
export const searchQuerySchema = z.object({
  q: z
    .string()
    .min(1, 'Query is required')
    .max(500, 'Query too long')
    .transform((val) => val.trim()),
})

// AI suggestion response
export const suggestionsResponseSchema = z.object({
  suggestions: z.array(z.string()).default([]),
})

// AI answer response
export const answerResponseSchema = z.object({
  answer: z.string().default(''),
})

// Search result item
export const searchResultSchema = z.object({
  title: z.string(),
  link: z.string().url(),
  snippet: z.string(),
  displayLink: z.string(),
})

// Search results response
export const searchResultsResponseSchema = z.object({
  results: z.array(searchResultSchema).default([]),
})

// API error response
export const errorResponseSchema = z.object({
  error: z.string(),
})

// Utility function to safely parse with fallback
export function safeParse<T>(schema: z.ZodSchema<T>, data: unknown): T | null {
  const result = schema.safeParse(data)
  return result.success ? result.data : null
}

// Validate search query from URL params
export function validateSearchQuery(searchParams: URLSearchParams): {
  valid: boolean
  query?: string
  error?: string
} {
  const q = searchParams.get('q')
  
  if (!q || q.trim().length === 0) {
    return { valid: false, error: 'Query is required' }
  }
  
  if (q.length > 500) {
    return { valid: false, error: 'Query too long (max 500 characters)' }
  }
  
  if (q.trim().length < 2) {
    return { valid: false, error: 'Query must be at least 2 characters' }
  }
  
  return { valid: true, query: q.trim() }
}
