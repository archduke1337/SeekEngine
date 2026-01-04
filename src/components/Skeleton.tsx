/**
 * Skeleton loading components
 */

export function SkeletonLine({ width = '100%' }: { width?: string }) {
  return (
    <div
      className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse"
      style={{ width }}
    />
  )
}

export function AnswerSkeleton() {
  return (
    <div className="space-y-3">
      <SkeletonLine width="100%" />
      <SkeletonLine width="95%" />
      <SkeletonLine width="88%" />
      <SkeletonLine width="70%" />
    </div>
  )
}

export function ResultCardSkeleton() {
  return (
    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
      <div className="flex items-start gap-3">
        {/* Favicon skeleton */}
        <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse flex-shrink-0" />
        
        <div className="flex-1 space-y-2">
          <div className="h-3 w-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="h-3 w-4/5 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
