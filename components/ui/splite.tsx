'use client'

import React, { Suspense, lazy } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'

const Spline = lazy(() => import('@splinetool/react-spline'))

interface SplineSceneProps {
  scene: string
  className?: string
  onLoad?: (spline: any) => void
  renderOnDemand?: boolean
}

class SplineErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center border border-zinc-800/50 rounded-2xl bg-zinc-900/20">
          <AlertCircle className="w-8 h-8 text-zinc-600 mb-2" />
          <p className="text-xs text-zinc-500 text-center px-4">
            El modelo 3D no está disponible o el servidor de Spline bloqueó la carga.
          </p>
        </div>
      )
    }

    return this.props.children
  }
}

export function SplineScene({ scene, className, onLoad, renderOnDemand = false }: SplineSceneProps) {
  return (
    <SplineErrorBoundary>
      <Suspense fallback={
        <div className="w-full h-full flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
        </div>
      }>
        <Spline
          scene={scene}
          className={className}
          onLoad={onLoad}
          renderOnDemand={renderOnDemand}
        />
      </Suspense>
    </SplineErrorBoundary>
  )
}

