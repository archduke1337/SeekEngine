'use client'

import { usePathname } from 'next/navigation'
import DynamicCanvasCrowd from '../footer/DynamicCanvasCrowd'

/**
 * ConditionalFooter — Shows the global CrowdCanvas footer
 * on all pages EXCEPT the results page.
 */
export default function ConditionalFooter() {
  const pathname = usePathname()

  // Hide the global footer on results page (it has its own footer)
  if (pathname.startsWith('/results')) return null

  return <DynamicCanvasCrowd />
}
