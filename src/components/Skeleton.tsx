/**
 * Skeleton loading components — Modern Design
 */

export function SkeletonLine({ width = '100%' }: { width?: string }) {
  return (
    <div
      className="h-4 rounded-md animate-pulse bg-muted/50"
      style={{ width }}
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
    <div className="p-4 rounded-xl border border-border/30 bg-card/30">
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md animate-pulse bg-muted/40" />
          <div className="h-3 w-24 rounded-md animate-pulse bg-muted/30" />
        </div>
        <div className="h-4 w-3/4 rounded-md animate-pulse bg-muted/40" />
        <div className="space-y-1.5">
          <div className="h-3 w-full rounded-md animate-pulse bg-muted/25" />
          <div className="h-3 w-4/5 rounded-md animate-pulse bg-muted/25" />
        </div>
      </div>
    </div>
  )
}
