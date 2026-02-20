'use client'

import dynamic from 'next/dynamic'

const CrowdCanvas = dynamic(() => import('./CanvasCrowd'), { ssr: false })

export default function DynamicCanvasCrowd() {
  return (
    <footer className="relative w-full overflow-hidden h-[50vh]">
      {/* Gradient fade at top */}
      <div
        className="absolute top-0 left-0 right-0 h-16 z-10 pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, hsl(var(--background)), transparent)`,
        }}
      />
      <CrowdCanvas src="/images/peeps/all-peeps.png" rows={15} cols={7} />
      {/* Footer content */}
      <div className="absolute bottom-0 w-full z-20 pb-6 px-6 flex flex-col items-center gap-3">
        <div className="flex items-center gap-8 text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground/40">
          <span>SeekEngine</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/20" />
          <span>&copy; {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="https://archduke.is-a.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] tracking-wider uppercase text-muted-foreground/30 hover:text-foreground transition-colors"
          >
            Developer
          </a>
          <a
            href="https://github.com/archduke1337/SeekEngine"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] tracking-wider uppercase text-muted-foreground/30 hover:text-foreground transition-colors"
          >
            Source
          </a>
        </div>
      </div>
    </footer>
  )
}
