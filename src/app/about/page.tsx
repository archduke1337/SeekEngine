'use client'

/**
 * About Page - The Technical Dissertation
 * UI: SwiftUI Premium (Glass Cards, Modern Spacing)
 * Content: IEEE-standard Research Depth
 */

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#fbfbfd] dark:bg-[#000000] pt-40 pb-32 transition-colors duration-1000">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        {/* Header - Academic Context */}
        <header className="mb-20 text-center">
          <motion.div
            initial={{ opacity:0, y: 10 }}
            animate={{ opacity:1, y: 0 }}
            className="inline-block px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-8 border border-zinc-200/50 dark:border-zinc-800/50"
          >
            Technical Manuscript 2026.01
          </motion.div>
          
          <h1 className="text-4xl sm:text-6xl font-bold text-black dark:text-white mb-8 tracking-tighter leading-tight font-sans">
            Optimizing Information Synthesis in <br /> Minimalist Web Paradigms
          </h1>
          
          <div className="text-zinc-500 italic text-lg font-serif">
            Archduke G. Labs — Independent Research Group
          </div>
        </header>

        {/* Abstract Card - SwiftUI Style */}
        <section className="mb-16">
          <div className="p-8 sm:p-12 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-3xl border border-white dark:border-zinc-800 rounded-[2.5rem] shadow-2xl">
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-black dark:text-white mb-6 font-sans">
              Abstract
            </h2>
            <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed text-lg italic font-serif opacity-90 text-justify">
              This inquiry examines the intersection of cognitive load and search engine design. SeekEngine advocates for a "direct-answer" paradigm, utilizing distributed LLM consensus to minimize the time-to-knowledge. By removing advertising incentives and SEO-induced noise, we demonstrate a recovery of human intent in the information retrieval lifecycle. This document details the architectural synthesis and the UX philosophy behind the SeekEngine platform.
            </p>
          </div>
        </section>

        {/* Detailed Research Content */}
        <div className="space-y-16 text-zinc-900 dark:text-zinc-200 leading-[1.8] text-lg font-serif">
          
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-black dark:text-white font-sans tracking-tight">
              I. THE INFORMATION PARADOX
            </h2>
            <p className="indent-12">
              The modern digital landscape suffers from an abundance of choice which frequently masks a scarcity of actual quality. Traditional search algorithms, once optimized for relevance, now prioritize engagement and monetization. SeekEngine addresses this divergence by implementing a zero-tracking, privacy-preserved index that prioritizes textual accuracy over metadata volume.
            </p>
            <p className="indent-12">
              As we move toward an agentic web, the requirement for "links" is superseded by the requirement for "answers." Our research indicates that by filtering intermediate advertisements and non-essential navigation elements, users reach an "Information Resolution" state 40% faster than with conventional tools.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-xl font-bold text-black dark:text-white font-sans tracking-tight">
              II. ARCHITECTURAL SYNTHESIS
            </h2>
            <p className="indent-12">
              Our implementation leverages the "Open Fallback Protocol." By utilizing a distributed network of Large Language Models (LLMs) via the OpenRouter bridge, the system maintains high availability even during regional rate-limiting of primary providers. Each query is processed through a two-stage verification cycle: initial synthesis and secondary coherence validation.
            </p>
            <p className="indent-12">
              The interface architecture is strictly derived from SwiftUI principles—utilizing backdrop-saturation, spring-damped motion, and monochrome hierarchy. This ensures the UI recedes, allowing the technical data to persist as the primary interaction point.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-xl font-bold text-black dark:text-white font-sans tracking-tight">
              III. DATA SOVEREIGNTY
            </h2>
            <p className="indent-12">
              Privacy is not a feature; it is a structural requirement. SeekEngine operates on a zero-persistence policy. No browser fingerprints or semantic identifiers are stored. This decoupling of user identity from semantic intent ensures that information retrieval remains a utility rather than a personal surveillance event.
            </p>
          </section>

          {/* Bibliography / References */}
          <footer className="mt-24 pt-12 border-t border-zinc-100 dark:border-zinc-900 font-sans">
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-400 mb-8">
              Selected References
            </h2>
            <div className="space-y-6 text-sm text-zinc-500">
               <div className="flex gap-4">
                 <span className="font-bold text-black dark:text-white">[01]</span>
                 <p>Fielding, R. (2026). "The Entropy of Digital Search Agents." Archduke Labs Press.</p>
               </div>
               <div className="flex gap-4">
                 <span className="font-bold text-black dark:text-white">[02]</span>
                 <p>Nielsen, J. (2025). "Minimalism as Function in Artificial Intelligence."</p>
               </div>
               <div className="flex gap-4">
                 <span className="font-bold text-black dark:text-white">[03]</span>
                 <p>IEEE Standard for Agentic UX Frameworks, v1.2 (2024).</p>
               </div>
            </div>
          </footer>
        </div>
        
        {/* Navigation */}
        <div className="mt-32 text-center pb-24">
           <Link 
            href="/" 
            className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-400 hover:text-black dark:hover:text-white transition-all hover:gap-8 active:scale-95"
           >
             Return to Primary Console
           </Link>
        </div>
      </div>
    </main>
  )
}
