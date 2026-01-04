'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

/**
 * ThreeErrorBoundary
 * Specifically catches WebGL/Three.js context losses or crashes
 * and provides a graceful fallback
 */
export class ThreeErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Three.js Error Boundary caught:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/20 backdrop-blur-2xl">
            <div className="text-center px-6">
              <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-bold mb-2">Engine Fallback Active</p>
              <h2 className="text-xl font-bold text-zinc-400 tracking-tight">System Visualization Offline</h2>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}
