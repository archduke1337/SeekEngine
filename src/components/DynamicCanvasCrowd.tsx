'use client'

import dynamic from 'next/dynamic'
import { useTheme } from 'next-themes'

const CanvasCrowd = dynamic(() => import('./CanvasCrowd'), { ssr: false })

export default function DynamicCanvasCrowd() {
  const { resolvedTheme } = useTheme()
  return <CanvasCrowd isDark={resolvedTheme === 'dark'} />
}
