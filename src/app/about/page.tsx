'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#fbfbfd] dark:bg-[#000000] pt-24 pb-40 transition-colors duration-1000 relative selection:bg-[#39ff14]/30">
      
      {/* Background Layers */}
      <div className="fixed inset-0 pointer-events-none bg-grid-black/[0.01] dark:bg-grid-white/[0.01]" />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        
        {/* Project Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-24 border-b border-black/5 dark:border-white/5 pb-10 text-left">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-widest border border-black/5 dark:border-white/5">Research Release v1.5</span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Model Cluster Active</span>
                </div>
                <h1 className="text-4xl sm:text-7xl font-bold text-black dark:text-white tracking-tight leading-[0.9]">
                    The Architecture <br /> of Intelligence.
                </h1>
            </div>
            <div className="text-right hidden md:block text-zinc-400">
                <p className="text-[10px] font-mono uppercase tracking-widest leading-relaxed">
                    System Freeze: Jan 05, 2026 <br />
                    TTFT Target: &lt; 400ms <br />
                    Pune, India
                </p>
            </div>
        </div>

        {/* Narrative Flow */}
        <div className="space-y-40">
          
          {/* Section 01: The Core */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 text-left">
                <div className="space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600">Phase 01: The Core</p>
                    <h2 className="text-3xl sm:text-5xl font-bold text-black dark:text-white tracking-tight">Solving for Latency & Accuracy.</h2>
                </div>
                <div className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed space-y-4">
                    <p>
                        Most search engines force a compromise between deep reasoning and raw speed. SeekEngine dissolves this tradeoff by orchestrating a <span className="text-black dark:text-white font-semibold">Parallel Model Race.</span>
                    </p>
                    <p>
                        Every query triggers a cluster of redundant intelligence nodes. By racing models like <span className="text-black dark:text-white font-semibold font-mono">Gemini</span>, <span className="text-black dark:text-white font-semibold font-mono">Nemotron</span>, and <span className="text-black dark:text-white font-semibold font-mono">Llama</span> in parallel, we deliver the first valid responder to your screen in sub-400ms.
                    </p>
                </div>
            </div>
            
            {/* Visual: Logic Map - High Fidelity Circuit */}
            <div className="relative p-8 sm:p-12 rounded-[3rem] bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 shadow-2xl overflow-hidden group">
                {/* Ambient Flow Path (SVG) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20 dark:opacity-40" viewBox="0 0 400 400">
                    <motion.path
                        d="M 50 100 L 350 100 L 350 300 L 50 300 Z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="0.5"
                        strokeDasharray="4 4"
                    />
                    <motion.circle
                        r="3"
                        fill="#ef4444"
                        animate={{ offsetDistance: ["0%", "100%"] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        style={{ offsetPath: "path('M 50 100 L 350 100 L 350 300 L 50 300 Z')" }}
                    />
                </svg>

                <div className="relative z-10 space-y-12">
                    {[
                        { step: "01", title: "Query Resolution", desc: "Intent capture via neural embeddings.", color: "bg-red-500" },
                        { step: "02", stepActive: true, title: "Parallel Race", desc: "Cluster: Gemini / Nemotron / Llama / Qwen", color: "bg-zinc-800 dark:bg-white" },
                        { step: "03", title: "Instant Synthesis", desc: "First-token-wins stream delivery.", color: "bg-green-500" }
                    ].map((item, i) => (
                        <div key={i} className="flex items-start gap-6 group/item">
                            <div className={`shrink-0 w-12 h-12 rounded-2xl ${item.stepActive ? item.color : 'bg-zinc-100 dark:bg-zinc-800'} flex items-center justify-center transition-all group-hover/item:scale-110 shadow-lg`}>
                                <span className={`text-xs font-black ${item.stepActive ? 'text-white dark:text-black' : 'text-zinc-400'}`}>{item.step}</span>
                            </div>
                            <div className="space-y-1 pt-1">
                                <h4 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider">{item.title}</h4>
                                <p className="text-[11px] text-zinc-500 dark:text-zinc-500 leading-none">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </section>

          {/* Section 02: Methodology */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center lg:flex-row-reverse">
            <div className="lg:order-2 space-y-8 text-left">
                <div className="space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600">Phase 02: Methodology</p>
                    <h2 className="text-3xl sm:text-5xl font-bold text-black dark:text-white tracking-tight">Industrial Grounding.</h2>
                </div>
                <div className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed space-y-4">
                    <p>
                        Verification is non-negotiable. Our research focused on defining a &quot;grounding boundary&quot; where the AI is strictly forbidden from generating information not found in the retrieved web index.
                    </p>
                    <p>
                        Through cross-validation across five distinct model architectures, we established a synthesis pipeline that ranks search nodes by neural relevance. This ensures the output is not just a summary, but a <span className="text-black dark:text-white font-semibold">verified intelligence report.</span>
                    </p>
                </div>
                <div className="pt-4">
                    <Link 
                        href="https://archduke.is-a.dev/research/seekengine" 
                        target="_blank"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-transform"
                    >
                        Read Technical Manuscript
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </Link>
                </div>
            </div>
            
            {/* Visual: UI Blueprint - Live Synthesis Flow */}
            <div className="lg:order-1 relative p-1 rounded-[3.5rem] bg-zinc-100 dark:bg-zinc-900 border border-black/5 dark:border-white/5 overflow-hidden shadow-inner group">
                <div className="bg-white dark:bg-black m-6 rounded-[2rem] border border-black/5 dark:border-white/5 p-8 space-y-6 shadow-2xl relative overflow-hidden">
                    {/* Live Flow HUD Header */}
                    <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Live_Synthesis_Engine</span>
                        </div>
                        <span className="text-[9px] font-mono text-zinc-300">0.024ms_Latency</span>
                    </div>

                    {/* Data Ingestion Path */}
                    <div className="relative h-32 w-full bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-black/5 dark:border-white/5 p-4 overflow-hidden">
                        <div className="flex justify-between h-full">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="w-px h-full bg-zinc-200 dark:bg-zinc-800 relative">
                                    <motion.div 
                                        animate={{ y: ["0%", "400%"] }}
                                        transition={{ duration: 2 + i, repeat: Infinity, ease: "linear" }}
                                        className="absolute -top-4 left-[-1.5px] w-[4px] h-4 bg-gradient-to-t from-red-500 to-transparent shadow-[0_0_8px_red]"
                                    />
                                </div>
                            ))}
                            <div className="absolute inset-x-0 bottom-4 px-4 flex justify-between">
                                <span className="text-[7px] font-bold text-zinc-400 tracking-tighter">SOURCE_NODE_ALPHA</span>
                                <span className="text-[7px] font-bold text-zinc-400 tracking-tighter">SOURCE_NODE_BETA</span>
                                <span className="text-[7px] font-bold text-zinc-400 tracking-tighter">SOURCE_NODE_GAMMA</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Consensus Core */}
                    <div className="p-6 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-black space-y-4">
                        <div className="flex justify-between items-center">
                            <h5 className="text-[10px] font-black uppercase tracking-widest leading-none">Intelligence_Cross_Check</h5>
                            <span className="text-[8px] font-bold opacity-50">98.4% Confidence</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[7px] font-black opacity-50 uppercase"><span>Claude_Node</span><span>Active</span></div>
                                <div className="h-1 w-full bg-white/10 dark:bg-black/10 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: "85%" }} className="h-full bg-red-500" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[7px] font-black opacity-50 uppercase"><span>Qwen_Node</span><span>Active</span></div>
                                <div className="h-1 w-full bg-white/10 dark:bg-black/10 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: "92%" }} className="h-full bg-red-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </section>

          {/* Section 03: The Build */}
          <section className="space-y-12 text-left">
            <div className="max-w-3xl space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600">Phase 03: The Build</p>
                <h2 className="text-3xl sm:text-6xl font-bold text-black dark:text-white tracking-tight">Engineering the Engine.</h2>
                <p className="text-lg text-zinc-600 dark:text-zinc-400">SeekEngine is built with a focus on speed and clarity. We stripped away the ads and the trackers to focus purely on the search results.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    {
                        title: "Frontend Stack",
                        desc: "Next.js 14 for server-side rendering, Framer Motion for smooth UI transitions, and Lenis for inertia-based scrolling.",
                    },
                    {
                        title: "API Layer",
                        desc: "Google Search API handles the retrieval, while OpenRouter provides access to the latest LLMs via a single endpoint.",
                    },
                    {
                        title: "Visual Core",
                        desc: "React Three Fiber powers the interactive 3D hero section, using GLSL shaders for the atmospheric background effects.",
                    }
                ].map((spec, i) => (
                    <div key={i} className="p-8 rounded-[2rem] bg-zinc-50 dark:bg-zinc-900 border border-black/5 dark:border-white/5">
                        <h3 className="text-xl font-bold text-black dark:text-white mb-3 tracking-tight">{spec.title}</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">{spec.desc}</p>
                    </div>
                ))}
            </div>
          </section>

          {/* Section 04: Research Artifacts */}
          <section className="bg-black dark:bg-zinc-900 rounded-[3rem] p-8 sm:p-16 text-left relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/[0.05] pointer-events-none" />
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20">
                <div className="space-y-8">
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-red-500">Academic Output</p>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Research Artifacts.</h2>
                    </div>
                    <div className="space-y-4">
                        {[
                            { label: "Technical Manuscript", val: "v2.1 Stable" },
                            { label: "Grounding Benchmark", val: "Multi-Model Consensus" },
                            { label: "Neural Flow Protocol", val: "Active Framework" },
                            { label: "Design System Freeze", val: "Jan 05, 2026" }
                        ].map((item, i) => (
                            <div key={i} className="flex justify-between items-center py-4 border-b border-white/5 last:border-0">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{item.label}</span>
                                <span className="text-xs font-mono text-zinc-200">{item.val}</span>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="space-y-8">
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 text-left">System Capability</p>
                        <h2 className="text-3xl font-bold text-white tracking-tight text-left">Industrial Specs.</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: "Avg TTFT", val: "384ms" },
                            { label: "Latency Target", val: "< 1.2s" },
                            { label: "Model Cluster", val: "08 Nodes" },
                            { label: "Search Tier", val: "Industrial" }
                        ].map((item, i) => (
                            <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/5">
                                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{item.label}</p>
                                <p className="text-lg font-bold text-white">{item.val}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          </section>

          {/* Contact Node */}
          <footer className="pt-20 border-t border-black/5 dark:border-white/5 text-left">
            <div className="flex flex-col md:flex-row justify-between gap-12">
                <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-300 dark:text-zinc-700">Project Correspondence</h3>
                    <p className="text-xl font-bold text-black dark:text-white">gauravramyadav@gmail.com</p>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-relaxed">Gaurav Yadav / archduke1337 — Pune, India</p>
                </div>
                <div className="flex gap-8 items-end">
                    <Link href="https://github.com/archduke1337/SeekEngine" target="_blank" className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-black dark:hover:text-white transition-colors">Github Repository</Link>
                    <Link href="https://archduke.is-a.dev" target="_blank" className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-black dark:hover:text-white transition-colors">Personal Portfolio</Link>
                </div>
            </div>
          </footer>
        </div>

        {/* Home Navigation */}
        <div className="fixed bottom-10 right-10 z-50">
          <Link 
            href="/"
            className="w-14 h-14 bg-white dark:bg-zinc-900 shadow-2xl border border-black/5 dark:border-white/10 rounded-[1.5rem] flex items-center justify-center hover:scale-105 active:scale-95 transition-all group overflow-hidden"
          >
            <svg className="w-5 h-5 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
        </div>
      </div>
    </main>
  )
}
