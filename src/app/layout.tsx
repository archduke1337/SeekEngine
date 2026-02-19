import type { Metadata, Viewport } from 'next'
import Navbar from '../components/Navbar'
import Providers from '../components/Providers'
import PageTransition from '../components/PageTransition'
import LenisProvider from '../components/LenisProvider'
import ErrorBoundary from '../components/ErrorBoundary'
import KeyboardShortcuts from '../components/KeyboardShortcuts'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import DynamicRiverFooter from '../components/DynamicRiverFooter'
import '../globals.css'

export const metadata: Metadata = {
  title: 'SeekEngine | Sync of Human Intent',
  description:
    'SeekEngine is an high-fidelity industrial AI search platform. Beyond traditional indexing, we operate at the intersection of neural resonance and raw mechanical speed.',
  keywords: ['AI Search', 'Neural Indexing', 'SeekEngine', 'RAG Intelligence', 'Industrial AI', 'Search Architecture', 'Future Search', 'Machine Learning Search'],
  authors: [{ name: 'SeekEngine Team', url: 'https://seekengine.vercel.app' }],
  metadataBase: new URL('https://seekengine.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'SeekEngine | Sync of Human Intent',
    description: 'The future of discovery is not a list of links. It is a sensed synthesis of human intent.',
    url: 'https://seekengine.vercel.app',
    siteName: 'SeekEngine',
    images: [
      {
        url: '/og-image.png', // Ensure this exists or I should generate an asset
        width: 1200,
        height: 630,
        alt: 'SeekEngine - Industrial Intelligence Interface',
      },
    ],
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SeekEngine | Sync of Human Intent',
    description: 'High-fidelity AI search for the next generation of discovery.',
    creator: '@archduke1337',
    images: ['/og-image.png'],
  },
  verification: {
    google: 'google-site-verification-placeholder',
    yandex: 'yandex-verification-placeholder',
    yahoo: 'yahoo-site-verification-placeholder',
    other: {
      'msvalidate.01': 'bing-verification-placeholder',
      'facebook-domain-verification': 'facebook-verification-placeholder',
    },
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://openrouter.ai" />
        <link rel="preconnect" href="https://www.googleapis.com" />
        <link rel="preconnect" href="https://serpapi.com" />
        <link rel="manifest" href="/manifest.json" />
        {/* JSON-LD Structured Data for Search Engines */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "SeekEngine",
              "url": "https://seekengine.vercel.app",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://seekengine.vercel.app/results?q={search_term_string}",
                "query-input": "required name=search_term_string"
              },
              "description": "High-fidelity industrial AI search platform.",
              "publisher": {
                "@type": "Organization",
                "name": "SeekEngine",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://seekengine.vercel.app/logo.png"
                }
              }
            })
          }}
        />
      </head>
      <body className="font-sans antialiased min-h-screen flex flex-col overflow-x-hidden">
        <Providers>
          <ErrorBoundary>
            <Navbar />
            <LenisProvider>
              <PageTransition>
                <div className="flex-1">
                   {children}
                </div>
                <DynamicRiverFooter />
              </PageTransition>
            </LenisProvider>
            <KeyboardShortcuts />
          </ErrorBoundary>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
