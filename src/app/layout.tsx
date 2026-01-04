import type { Metadata, Viewport } from 'next'
import Navbar from '../components/Navbar'
import Providers from '../components/Providers'
import PageTransition from '../components/PageTransition'
import { Analytics } from '@vercel/analytics/react'
import '../globals.css'

export const metadata: Metadata = {
  title: 'SeekEngine | Sensed Synthesis of Human Intent',
  description:
    'SeekEngine is an high-fidelity industrial AI search platform. Beyond traditional indexing, we operate at the intersection of neural resonance and raw mechanical speed.',
  keywords: ['AI Search', 'Neural Indexing', 'SeekEngine', 'RAG Intelligence', 'Industrial AI', 'Search Architecture'],
  authors: [{ name: 'SeekEngine Team', url: 'https://seekengine.vercel.app' }],
  metadataBase: new URL('https://seekengine.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'SeekEngine | Intelligent Search Interface',
    description: 'The future of discovery is not a list of links. It is a sensed synthesis of human intent.',
    url: 'https://seekengine.vercel.app',
    siteName: 'SeekEngine',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SeekEngine | AI Industrial Search',
    description: 'High-fidelity AI search for the next generation of discovery.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbfbfd' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://openrouter.ai" />
        <link rel="preconnect" href="https://www.googleapis.com" />
      </head>
      <body className="font-sans antialiased selection:bg-red-500/30 selection:text-red-900 dark:selection:text-red-100">
        <Providers>
          <Navbar />
          <PageTransition>
            {children}
          </PageTransition>
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
