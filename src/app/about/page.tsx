'use client'

/**
 * About Page - The Personal Manuscript
 * Author: Gaurav Yadav
 * Context: Pune, India | Cybersecurity & Web Development
 */

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f8f6f2] dark:bg-[#0a0a0a] pt-32 pb-32 transition-colors duration-1000 relative selection:bg-zinc-200">
      
      {/* Paper Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] z-50 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />

      <div className="max-w-5xl mx-auto px-10 relative z-10">
        
        {/* Academic Header Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-b-2 border-zinc-900/10 dark:border-zinc-100/10 pb-12 mb-20 text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-zinc-500">
          <div className="space-y-2">
            <div>Project: SeekEngine Core</div>
            <div>Author: Gaurav Yadav</div>
            <div>Focus: Hybrid RAG & Synthesis</div>
          </div>
          <div className="md:text-right space-y-2">
            <div>Repo: archduke1337/SeekEngine</div>
            <div>Status: Operational </div>
          </div>
        </div>

        {/* The Paper Body */}
        <div className="flex gap-16">
          
          {/* Side Gutter Line Numbers */}
          <div className="hidden lg:flex flex-col gap-6 text-[9px] font-mono text-zinc-300 dark:text-zinc-800 select-none pt-2 text-right w-8">
            {Array.from({ length: 45 }).map((_, i) => (
              <span key={i}>{(i + 1) * 10}</span>
            ))}
          </div>

          <article className="flex-1 space-y-20">
            {/* Title Block */}
            <header className="space-y-8 text-left">
              <h1 className="text-4xl sm:text-7xl font-bold text-black dark:text-white tracking-tight leading-[0.9] font-sans italic">
                A Dev's Attempt at <br /> Grounded Intent Synthesis
              </h1>
              
              <div className="flex flex-col gap-4 py-8 border-y border-zinc-900/10 dark:border-zinc-100/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xs font-black uppercase tracking-tighter">
                    GY
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-black dark:text-white">Gaurav Yadav</h2>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-black">Pune, Maharashtra, India</p>
                  </div>
                </div>
                <p className="text-zinc-500 text-sm font-serif italic max-w-xl">
                  Cybersecurity Researcher and Web Developer. Coding for fun by day, tinkering with search paradigms by night.
                </p>
              </div>
            </header>

            {/* Abstract Section */}
            <section className="bg-white/40 dark:bg-zinc-900/10 p-8 sm:p-12 border border-zinc-900/5 dark:border-zinc-100/5 rounded-sm relative shadow-sm">
              <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-black dark:text-white mb-8 border-b border-black/10 dark:border-white/10 pb-2 inline-block">
                Abstract
              </h2>
              <p className="font-serif text-lg sm:text-xl leading-relaxed text-zinc-800 dark:text-zinc-200 text-justify italic">
                "SeekEngine isn't some polished PhD thesis project. It's my messy, half-broken attempt at a search engine that doesn't lie. Built on Next.js 14, I hooked up Google Custom Search for the real-world validation and OpenRouter's AI for summaries that actually mean something. Tested on over 200 chaotic queries from my own life, it cuts hallucinations by 40%—not bad for a solo hack job."
              </p>
              
              <div className="mt-10 pt-8 border-t border-zinc-100 dark:border-zinc-900">
                <a 
                  href="https://archduke.is-a.dev/research/seekengine"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-4 px-6 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full text-[10px] font-black uppercase tracking-[0.4em] hover:scale-105 active:scale-95 transition-all shadow-xl"
                >
                  Research Paper
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </section>

            {/* The Raw Sections */}
            <div className="font-serif text-lg sm:text-xl leading-[1.7] text-zinc-800 dark:text-zinc-200 space-y-12 text-justify">
              
              <section className="space-y-6">
                <h3 className="font-sans font-black text-xs uppercase tracking-[0.4em] text-black dark:text-white mt-12">
                  I. RAG is Not Magic
                </h3>
                <p>
                  Retrieval-Augmented Generation (RAG) is often sold as a silver bullet, but anyone who's actually built one knows it's a fight against noise. In SeekEngine, I've implemented a "Discovery-Consensus" loop. We fetch live data first, then force the models to stay within the bounds of that data. It's not perfect, but it's a far cry from the hallucinated nonsense of earlier attempts.
                </p>
              </section>

              <section className="space-y-6">
                <h3 className="font-sans font-black text-xs uppercase tracking-[0.4em] text-black dark:text-white mt-12">
                  II. Minimalism as Defense
                </h3>
                <p>
                  The UI is bare because I hate clutter. Life is complicated enough—searching for answers shouldn't be. Every pixel in this build is designed to recede, using Apple-inspired typography and SwiftUI glass textures to let the data be the hero. No ads, no tracking, no SEO games.
                </p>
              </section>

              <section className="space-y-6">
                <h3 className="font-sans font-black text-xs uppercase tracking-[0.4em] text-black dark:text-white mt-12">
                  III. Conclusion & Code
                </h3>
                <p>
                  This is still a work in progress. Deployed at vercel and hosted on Github. It's open source because I want other devs to see the ugly parts too—the parts that actually teach you how things work.
                </p>
              </section>
            </div>

            {/* Footer / References */}
            <footer className="pt-20 border-t-2 border-zinc-900/10 dark:border-zinc-100/10 font-sans">
              <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 mb-10">
                Author & Project Details
              </h2>
              <div className="space-y-8 text-xs text-zinc-500 font-medium">
                 <div className="flex gap-6">
                   <span className="text-black dark:text-white font-black">[Mail]</span>
                   <p className="max-w-xl">gauravramyadav@gmail.com</p>
                 </div>
                 <div className="flex gap-6">
                   <span className="text-black dark:text-white font-black">[Web]</span>
                   <p className="max-w-xl">https://archduke.is-a.dev</p>
                 </div>
                 <div className="flex gap-6">
                   <span className="text-black dark:text-white font-black">[Git]</span>
                   <p className="max-w-xl">https://github.com/archduke1337/SeekEngine</p>
                 </div>
              </div>
            </footer>
          </article>
        </div>

        {/* Home Navigation */}
        <div className="fixed bottom-10 left-10 z-50">
          <Link 
            href="/"
            className="w-14 h-14 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all group"
          >
            <svg className="w-4 h-4 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
        </div>
      </div>
    </main>
  )
}
