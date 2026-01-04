import type { Metadata, Viewport } from 'next'
import Navbar from '../components/Navbar'
import Providers from '../components/Providers'
import PageTransition from '../components/PageTransition'
import '../globals.css'

export const metadata: Metadata = {
  title: 'SeekEngine - AI-Powered Search',
  description:
    'A minimalist search engine with AI-powered suggestions and summaries',
  keywords: ['search', 'ai', 'search engine', 'llm', 'answers'],
  authors: [{ name: 'Archduke', url: 'https://archduke.is-a.dev' }],
  openGraph: {
    title: 'SeekEngine - AI-Powered Search',
    description: 'Get instant AI-powered answers to your questions',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
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
        {/* Preconnect to API endpoints for faster requests */}
        <link rel="preconnect" href="https://openrouter.ai" />
        <link rel="preconnect" href="https://www.googleapis.com" />
        <link rel="dns-prefetch" href="https://openrouter.ai" />
        <link rel="dns-prefetch" href="https://www.googleapis.com" />
      </head>
      <body className="font-sans antialiased">
        <Providers>
          <Navbar />
          <PageTransition>
            {children}
          </PageTransition>
        </Providers>
      </body>
    </html>
  )
}
