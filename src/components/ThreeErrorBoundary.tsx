'use client'

import React from 'react'

interface State {
  hasError: boolean
}

export class ThreeErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error('[ThreeErrorBoundary]', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 bg-black flex items-center justify-center">
          <div className="text-xs tracking-widest uppercase text-zinc-500">
            System visualization offline
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
