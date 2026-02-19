import Link from 'next/link'
 
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 bg-white dark:bg-black transition-colors">
      {/* Error code */}
      <div className="relative">
        <span className="text-[120px] sm:text-[160px] font-bold tracking-tighter leading-none text-zinc-100 dark:text-zinc-900 select-none">
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Page Not Found
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs">
              This node doesn&apos;t exist in the search index.
            </p>
          </div>
        </div>
      </div>
      
      <Link 
        href="/" 
        className="mt-4 px-6 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black text-sm font-medium hover:opacity-80 transition-opacity active:scale-95"
      >
        Return to Engine
      </Link>
    </div>
  )
}
