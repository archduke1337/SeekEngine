'use client'

import dynamic from 'next/dynamic'

const RiverFooter = dynamic(() => import('./RiverFooter'), { ssr: false })

export default function DynamicRiverFooter() {
  return <RiverFooter />
}
