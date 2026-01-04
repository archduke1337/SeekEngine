'use client'

import { ReactNode } from 'react'
import { ThemeProvider } from 'next-themes'
import LenisProvider from './LenisProvider'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
    >
      <LenisProvider>{children}</LenisProvider>
    </ThemeProvider>
  )
}
