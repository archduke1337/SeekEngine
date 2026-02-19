/**
 * Skeleton loading components — Retro-Futuristic
 */

export function SkeletonLine({ width = '100%' }: { width?: string }) {
  return (
    <div
      className="h-4 rounded animate-pulse"
      style={{ width, background: 'rgba(0,255,240,0.04)', border: '1px solid rgba(0,255,240,0.03)' }}
    />
  )
}

export function AnswerSkeleton() {
  return (
    <div className="space-y-3 py-2">
      <SkeletonLine width="100%" />
      <SkeletonLine width="95%" />
      <SkeletonLine width="88%" />
      <SkeletonLine width="70%" />
    </div>
  )
}

export function ResultCardSkeleton() {
  return (
    <div className="p-4 rounded-xl" style={{ background: 'rgba(14,14,22,0.4)', border: '1px solid rgba(0,255,240,0.04)' }}>
      <div className="space-y-2">
        {/* Header skeleton */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded animate-pulse" style={{ background: 'rgba(0,255,240,0.06)' }} />
          <div className="h-3 w-24 rounded animate-pulse" style={{ background: 'rgba(0,255,240,0.04)' }} />
        </div>
        
        {/* Title skeleton */}
        <div className="h-4 w-3/4 rounded animate-pulse" style={{ background: 'rgba(0,255,240,0.05)' }} />
        
        {/* Snippet skeleton */}
        <div className="space-y-1.5">
          <div className="h-3 w-full rounded animate-pulse" style={{ background: 'rgba(0,255,240,0.03)' }} />
          <div className="h-3 w-4/5 rounded animate-pulse" style={{ background: 'rgba(0,255,240,0.03)' }} />
        </div>
      </div>
    </div>
  )
}
