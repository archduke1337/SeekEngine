/**
 * Skeleton loading components
 */

export function SkeletonLine({ width = '100%' }: { width?: string }) {
  return (
    <div
      className="h-4 bg-zinc-100 dark:bg-zinc-800/80 rounded-lg animate-pulse"
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
    <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-100 dark:border-zinc-800">
      <div className="space-y-2.5">
        {/* Header skeleton */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          <div className="h-3 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
        </div>
        
        {/* Title skeleton */}
        <div className="h-4 w-3/4 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
        
        {/* Snippet skeleton */}
        <div className="space-y-1.5">
          <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
          <div className="h-3 w-4/5 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  )
}
