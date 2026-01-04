/**
 * Homepage - SwiftUI Premium Experience
 * Features: 3D interactive hero, fluid deblur, floating glass search architecture.
 * Updated: Apple Typography, Improved Content, capabilities scroll section.
 */

'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { motion, useScroll, useTransform, useMotionTemplate, AnimatePresence } from 'framer-motion'
import SearchBar from '../components/SearchBar'
import RiverFooter from '../components/RiverFooter'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useEffect, useState as useReactState } from 'react'
import { ThreeErrorBoundary } from '../components/ThreeErrorBoundary'

const Hero3D = dynamic(() => import('../components/Hero3D'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-white dark:bg-black" />,
})

export default function Home() {
  const router = useRouter()
  const { theme, resolvedTheme } = useTheme()
  const { scrollY } = useScroll()
  const [isTyping, setIsTyping] = useState(false)
  const [mounted, setMounted] = useReactState(false)
  const [windowWidth, setWindowWidth] = useReactState(0)

  useEffect(() => {
    setMounted(true)
    setWindowWidth(window.innerWidth)
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  const blurValue = useTransform(scrollY, [0, 400], [0, 15])
  const opacityValue = useTransform(scrollY, [100, 400], [1, 0.15])
  const heroScale = useTransform(scrollY, [0, 500], [1, 1.3])
  const contentY = useTransform(scrollY, [0, 500], [0, -80])
  const backdropFilter = useMotionTemplate`blur(${blurValue}px)`

  const isDark = mounted ? resolvedTheme === 'dark' : true
  const isMobile = windowWidth < 768

  return (
    <>
      <main className="min-h-screen flex flex-col bg-[#fbfbfd] dark:bg-[#000000] transition-colors duration-1000 overflow-x-hidden">
        
        {/* Dynamic Grid Overlay */}
        <div className="fixed inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] pointer-events-none" />

        {/* Hero Section */}
        <section className="relative h-screen flex flex-col items-center justify-center px-6">
          <motion.div style={{ scale: heroScale, opacity: opacityValue }} className="absolute inset-0 z-0">
            <ThreeErrorBoundary>
              <Hero3D isHighPower={isTyping} isDark={isDark} isMobile={isMobile} />
            </ThreeErrorBoundary>
          </motion.div>

          <motion.div 
            style={{ backdropFilter, WebkitBackdropFilter: backdropFilter }}
            className="absolute inset-0 pointer-events-none z-10"
          />

          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#fbfbfd] dark:to-black z-20 pointer-events-none" />

          {/* Heading and Search */}
          <motion.div 
            style={{ y: contentY }}
            className="w-full max-w-5xl relative z-30 flex flex-col items-center gap-10 sm:gap-16"
          >
            <div className="text-center space-y-8 sm:space-y-12">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <h1 className="sr-only">SeekEngine</h1>
                <div className="h-32 sm:h-56" /> {/* Reduced Spacer for 3D Hero Title */}
                
                <motion.p 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  className="text-lg sm:text-3xl text-zinc-500 dark:text-zinc-400 font-medium max-w-3xl mx-auto leading-relaxed tracking-tighter px-6 font-sans italic"
                >
                  The future of discovery is not a list of links. <br className="hidden sm:block" />
                  It is a <span className="text-black dark:text-white font-black not-italic border-b border-black/10 dark:border-white/10 pb-1">sensed synthesis of human intent.</span>
                </motion.p>
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.8, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-2xl px-6 relative"
            >
              <SearchBar autoFocus onTyping={setIsTyping} />
            </motion.div>
          </motion.div>

          {/* Minimal Scroll Hint */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0] }}
            transition={{ delay: 4, duration: 2, repeat: Infinity }}
            className="absolute bottom-12 z-40 flex flex-col items-center gap-4 cursor-pointer"
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          >
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-600">Initialize Exploration</span>
             <div className="w-[1px] h-14 bg-gradient-to-b from-black dark:from-white to-transparent" />
          </motion.div>
        </section>

        {/* Capabilities Section */}
        <section className="relative py-32 px-6 flex flex-col items-center">
            {/* Header */}
            <div className="w-full max-w-5xl mb-24 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-8 border-b border-black/5 dark:border-white/5 pb-12">
                <div className="space-y-4">
                    <p className="text-[10px] uppercase tracking-[0.4em] font-black text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]">Core Architecture</p>
                    <h2 className="text-4xl sm:text-6xl font-black text-black dark:text-white tracking-tighter leading-[0.9]">
                        Mechanical <br /> Efficiency.
                    </h2>
                </div>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium max-w-xs text-sm sm:text-lg leading-relaxed tracking-tight">
                    Beyond traditional indexing. We operate at the intersection of neural resonance and raw mechanical speed.
                </p>
            </div>

            {/* Capability Grid */}
            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-40">
                {[
                    { 
                        title: "Neural Synthesis", 
                        desc: "Real-time RAG architecture that transforms queries into multidimensional intelligence mappings.", 
                        tag: "Resonance",
                        status: "Active"
                    },
                    { 
                        title: "Global Indexing", 
                        desc: "Distributed consensus-based search mapping that reaches across the edge to resolve context.", 
                        tag: "Consensus",
                        status: "Syncing"
                    },
                    { 
                        title: "Console Execution", 
                        desc: "Direct system interactions through Console Mode. Move at the speed of command lines.", 
                        tag: "Direct",
                        status: "Awaiting"
                    }
                ].map((cap, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="group relative p-8 sm:p-10 rounded-[2.5rem] bg-white dark:bg-zinc-900/40 border border-black/5 dark:border-white/5 shadow-xl overflow-hidden transition-all duration-700 hover:shadow-2xl hover:scale-[1.02]"
                    >
                        {/* Thermal Glow */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/5 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                        
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-600 border border-black/10 dark:border-white/10 px-3 py-1 rounded-full">
                                    {cap.tag}
                                </span>
                                <div className="flex items-center gap-2">
                                     <span className="text-[8px] font-black uppercase tracking-tighter text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500">{cap.status}</span>
                                     <div className="w-1.5 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 group-hover:bg-red-500 transition-colors duration-500 shadow-[0_0_10px_red] shadow-transparent group-hover:shadow-red-500/50" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-black text-black dark:text-white tracking-tight leading-none">{cap.title}</h3>
                            <p className="text-zinc-500 dark:text-zinc-500 text-sm leading-relaxed tracking-tight">{cap.desc}</p>
                            
                            <div className="pt-4 flex items-center gap-2">
                                <span className="w-8 h-[1px] bg-zinc-200 dark:bg-zinc-800 group-hover:w-16 group-hover:bg-red-500 transition-all duration-700" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-transparent group-hover:text-red-500 transition-all duration-700">Initialize</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* How It Works - Visual Architecture Diagram */}
            <div className="w-full max-w-5xl mb-40">
                <div className="text-center mb-20 space-y-4">
                    <p className="text-[10px] uppercase tracking-[0.4em] font-black text-zinc-400">Intelligent Flow</p>
                    <h2 className="text-3xl sm:text-5xl font-black text-black dark:text-white tracking-tighter">Workflow Visualization.</h2>
                </div>

                <div className="relative grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
                    {[
                        { step: "01", name: "Intent", detail: "Query Capture", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
                        { step: "02", name: "Synthesis", detail: "RAG Core", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
                        { step: "03", name: "Index", detail: "Global Mapping", icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 9m0 11V9" },
                        { step: "04", name: "Result", detail: "Consensus", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }
                    ].map((item, i) => (
                        <div key={i} className="relative group">
                            {/* Animated Connecting Path (Desktop only) */}
                            {i < 3 && (
                                <div className="hidden md:block absolute top-1/2 left-[calc(100%-1rem)] w-[calc(100%-2rem)] h-[1px] bg-zinc-200 dark:bg-zinc-800 z-0">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        whileInView={{ width: "100%" }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.4 + 0.5, duration: 1 }}
                                        className="h-full bg-red-500 shadow-[0_0_8px_red]"
                                    />
                                </div>
                            )}
                            
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2, duration: 0.8 }}
                                className="relative z-10 flex flex-col items-center p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 shadow-lg group-hover:border-red-500/30 transition-all duration-500"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center mb-6 group-hover:bg-red-500 transition-colors duration-500 group-hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                                    <svg className="w-6 h-6 text-zinc-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                                    </svg>
                                </div>
                                <span className="text-[10px] font-black text-red-500 mb-1">{item.step}</span>
                                <h3 className="text-xl font-black text-black dark:text-white tracking-tight mb-2">{item.name}</h3>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{item.detail}</p>
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Technical Node Status - Industrial HUD */}
            <div className="w-full max-w-5xl bg-zinc-950 rounded-[3rem] p-8 sm:p-16 overflow-hidden relative border border-white/5">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-grid-white/[0.03] pointer-events-none" />
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
                
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-10">
                        <div className="space-y-4">
                            <p className="text-[10px] uppercase tracking-[0.4em] font-black text-zinc-500">Live Infrastructure</p>
                            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tighter leading-none">
                                Neural <br /> Mapping Status.
                            </h2>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-8">
                            {[
                                { label: "Index Rate", value: "1.4M paths/s" },
                                { label: "Latency", value: "42ms" },
                                { label: "Nodes", value: "812 Active" },
                                { label: "Verified", value: "99.99%" }
                            ].map((stat, i) => (
                                <div key={i} className="space-y-1">
                                    <p className="text-[9px] uppercase tracking-widest font-bold text-zinc-600">{stat.label}</p>
                                    <p className="text-lg font-black text-white tracking-tight">{stat.value}</p>
                                </div>
                            ))}
                        </div>
                        
                        <div className="p-1 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-all">
                             <div className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">View Node Network</div>
                             <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-red-500 transition-colors">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                             </div>
                        </div>
                    </div>
                    
                    {/* Visual Terminus */}
                    <div className="relative h-[350px] bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 font-mono overflow-hidden group">
                         <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
                            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_red]" />
                            <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">System Terminus // Edge_Route_42</span>
                         </div>
                         
                         <div className="space-y-3 opacity-60 group-hover:opacity-100 transition-opacity duration-1000">
                             {[
                                ">>> INITIALIZING CONSENSUS_MESH",
                                ">>> CONNECTING_TO_GLOBAL_WARP... SUCCESS",
                                ">>> MAPPING_RECURSIVE_DISCOVERY_NODES [812/812]",
                                ">>> LATENCY_RESISTANCE: OPTIMAL (42ms)",
                                ">>> ANALYZING_HUMAN_INTENT_VECTORS...",
                                ">>> SYNTHESIS_PROTOCOL: ACTIVE",
                                ">>> STANDBY_FOR_QUERY_EMISSION..."
                             ].map((line, i) => (
                                <p key={i} className="text-[10px] text-red-500/80 leading-tight tracking-tighter">
                                    <span className="text-zinc-700 mr-2">[{1000 + i}]</span> {line}
                                </p>
                             ))}
                         </div>
                         
                         {/* Scanline Effect */}
                         <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-20" />
                    </div>
                </div>
            </div>
        </section>

        {/* System Philosophy Section */}
        <section className="relative py-40 px-6 flex flex-col items-center bg-zinc-950/40 border-t border-black/5 dark:border-white/5">
             <div className="w-full max-w-2xl text-center space-y-10 relative z-10">
                 <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="inline-block px-4 py-1.5 rounded-full border border-red-500/20 bg-red-500/5 text-[9px] font-black uppercase tracking-[0.3em] text-red-500"
                 >
                    Technical Manifesto
                 </motion.div>
                 
                 <h2 className="text-4xl sm:text-6xl font-black text-black dark:text-white tracking-tighter leading-none">
                    Intelligence <br /> as a Utility.
                 </h2>
                 
                 <p className="text-zinc-500 dark:text-zinc-400 text-lg sm:text-2xl font-medium tracking-tight leading-relaxed max-w-xl mx-auto italic">
                    "We do not seek to provide data. We seek to provide clarity. SeekEngine is the protocol through which human intent finds its most efficient physical representation."
                 </p>
                 
                 <div className="pt-10 flex flex-col sm:flex-row items-center justify-center gap-6">
                     <button 
                        onClick={() => router.push('/about')}
                        className="px-8 py-4 rounded-2xl bg-black dark:bg-white text-white dark:text-black text-[11px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl"
                     >
                        Read the Manuscript
                     </button>
                     <div className="flex items-center gap-3 px-6 py-4 rounded-2xl border border-black/5 dark:border-white/10 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        System Ready
                     </div>
                 </div>
             </div>
             
             {/* Subsurface Grit Layer */}
             <div className="absolute inset-0 bg-grid-black/[0.01] dark:bg-grid-white/[0.01] pointer-events-none" />
        </section>

        <RiverFooter />
      </main>
    </>
  )
}
