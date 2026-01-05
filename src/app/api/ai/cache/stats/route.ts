/**
 * API Route: /api/ai/cache/stats
 * Returns semantic cache statistics for monitoring
 */

import { getCacheStats, clearExpiredEntries } from '../../../../../lib/semantic-cache'
import { NextResponse } from 'next/server'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function GET() {
  // Clean up expired entries first
  const cleared = clearExpiredEntries()
  
  // Get current stats
  const stats = getCacheStats()
  
  return NextResponse.json({
    ...stats,
    clearedExpired: cleared,
    timestamp: Date.now(),
  })
}
