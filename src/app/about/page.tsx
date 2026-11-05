import type { Metadata } from 'next'
import AboutContent from './AboutContent'

export const metadata: Metadata = {
  title: 'About | SeekEngine',
  description: 'Learn about SeekEngine - an open source AI-enhanced search engine built with grounding and retrieval-augmented generation research.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About | SeekEngine',
    description: 'Learn about SeekEngine - an open source AI-enhanced search engine built with grounding and retrieval-augmented generation research.',
    url: 'https://seekengine.vercel.app/about',
    siteName: 'SeekEngine',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SeekEngine - About',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About | SeekEngine',
    description: 'Learn about SeekEngine - an open source AI-enhanced search engine built with grounding and retrieval-augmented generation research.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
  },
}

export default function AboutPage() {
  return <AboutContent />
}
