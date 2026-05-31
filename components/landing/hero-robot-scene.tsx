'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SplineScene } from '@/components/ui/splite'

type SplineObject = {
  name: string
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number }
}

type SplineApp = {
  getAllObjects: () => SplineObject[]
}

const HEAD_NAME_PATTERNS = [/head/i, /helmet/i, /face/i, /visor/i]
const EXCLUDED_NAME_PATTERNS = [/camera/i, /light/i, /shadow/i, /floor/i, /ground/i, /background/i, /bg/i]

export function HeroRobotScene() {
  const heroRef = useRef<HTMLElement | null>(null)
  const splineRef = useRef<SplineApp | null>(null)
  const headRef = useRef<SplineObject | null>(null)
  const [headName, setHeadName] = useState('')
  const [pointerGlow, setPointerGlow] = useState({ x: 0, y: 0, visible: false })

  const heroGlowStyle = useMemo(
    () => ({
      background:
        'radial-gradient(circle at 82% 38%, rgba(34,211,238,0.08), transparent 24%), radial-gradient(circle at 86% 52%, rgba(34,211,238,0.06), transparent 18%)',
    }),
    []
  )

  const findHeadObject = useCallback((app: SplineApp) => {
    const objects = app.getAllObjects()
    const target = objects.find((object) => HEAD_NAME_PATTERNS.some((pattern) => pattern.test(object.name))) ?? objects
      .filter((object) => !EXCLUDED_NAME_PATTERNS.some((pattern) => pattern.test(object.name)))
      .sort((a, b) => b.position.y - a.position.y)[0]
    if (!target) {
      return null
    }

    headRef.current = target
    setHeadName(target.name)

    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
      const debugWindow = window as typeof window & {
        __costackHeroHeadName?: string
        __costackHeroObjectNames?: string[]
      }

      debugWindow.__costackHeroHeadName = target?.name ?? ''
      debugWindow.__costackHeroObjectNames = objects.map((object) => object.name)
    }

    return target
  }, [])

  const onLoad = useCallback((app: SplineApp) => {
    splineRef.current = app
    const attemptFindHead = () => findHeadObject(app)

    if (attemptFindHead()) {
      return
    }

    let attempts = 0
    const intervalId = window.setInterval(() => {
      attempts += 1

      if (attemptFindHead() || attempts >= 12) {
        window.clearInterval(intervalId)
      }
    }, 250)
  }, [findHeadObject])

  const updateHeadLook = useCallback((clientX: number, clientY: number) => {
    const hero = heroRef.current
    const head = headRef.current

    if (!hero || !head) {
      return
    }

    const rect = hero.getBoundingClientRect()
    const xRatio = Math.max(-1, Math.min(1, ((clientX - rect.left) / rect.width) * 2 - 1))
    const yRatio = Math.max(-1, Math.min(1, ((clientY - rect.top) / rect.height) * 2 - 1))

    head.rotation.y = xRatio * 0.75
    head.rotation.x = yRatio * 0.38
    head.rotation.z = xRatio * 0.12

    setPointerGlow({
      x: clientX - rect.left,
      y: clientY - rect.top,
      visible: true,
    })
  }, [])

  const resetHeadLook = useCallback(() => {
    if (!headRef.current) {
      setPointerGlow((current) => ({ ...current, visible: false }))
      return
    }

    headRef.current.rotation.x = 0
    headRef.current.rotation.y = 0
    headRef.current.rotation.z = 0
    setPointerGlow((current) => ({ ...current, visible: false }))
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
      ;(window as typeof window & { __costackHeroHeadName?: string }).__costackHeroHeadName = headName
    }
  }, [headName])

  return (
    <section
      ref={heroRef}
      onPointerMove={(event) => updateHeadLook(event.clientX, event.clientY)}
      onPointerLeave={resetHeadLook}
      data-head-target={headName || undefined}
      className="relative overflow-hidden border-b border-white/5"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(6,182,212,0.12),transparent_28%),radial-gradient(circle_at_82%_40%,rgba(6,182,212,0.1),transparent_24%),linear-gradient(180deg,rgba(10,15,30,0.1)_0%,rgba(10,15,30,0.68)_58%,rgba(10,15,30,1)_100%)]" />

      <div className="absolute inset-y-0 right-0 w-full md:w-[58%] pointer-events-none">
        <SplineScene
          scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
          onLoad={onLoad}
          renderOnDemand={false}
          className="h-full w-full scale-[1.08] translate-x-10 md:scale-[1.18] md:translate-x-14 lg:scale-[1.22] lg:translate-x-20"
        />
      </div>

      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#0a0f1e] via-[#0a0f1e]/86 to-transparent md:via-[#0a0f1e]/72" />
      <div className="absolute inset-y-0 right-0 w-1/2 pointer-events-none opacity-60" style={heroGlowStyle} />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute z-[30] h-72 w-72 rounded-full blur-3xl transition-[opacity,transform] duration-150 ease-out"
        style={{
          opacity: pointerGlow.visible ? 1 : 0,
          mixBlendMode: 'screen',
          transform: `translate3d(${pointerGlow.x - 144}px, ${pointerGlow.y - 144}px, 0)`,
          background:
            'radial-gradient(circle, rgba(34,211,238,0.52) 0%, rgba(34,211,238,0.28) 18%, rgba(34,211,238,0.14) 36%, transparent 72%)',
          boxShadow: '0 0 160px rgba(34,211,238,0.6)',
        }}
      >
        <div
          className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-50 shadow-[0_0_34px_rgba(34,211,238,1)]"
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none z-[2] opacity-18"
        style={{
          background:
            'radial-gradient(circle 68px at 76% 24%, rgba(34,211,238,0.05), transparent 60%), radial-gradient(circle 42px at 76% 25%, rgba(255,255,255,0.03), transparent 72%)',
        }}
      />
      <div className="absolute inset-x-0 bottom-0 pointer-events-none h-32 bg-gradient-to-t from-[#0a0f1e] to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-73px)] max-w-7xl items-center px-6 py-16 md:px-12 lg:px-12 xl:px-14">
        <div className="max-w-[34rem] text-left lg:-translate-x-6 xl:-translate-x-10">
          <div className="relative mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-4 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-cyan-300 shadow-lg shadow-cyan-500/10 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 animate-pulse" />
            Bot de acceso
          </div>

          <h1 className="relative text-5xl font-extrabold leading-[0.94] tracking-tight text-balance drop-shadow-2xl sm:text-6xl md:text-7xl lg:text-[5rem] xl:text-[5.6rem]">
            <span className="text-white">CoStack </span>
            <span className="bg-gradient-to-b from-cyan-300 via-cyan-400 to-cyan-600 bg-clip-text text-transparent">
              automatiza
            </span>
            <br className="hidden sm:block" />
            <span className="text-white">accesos y licencias</span>
          </h1>

          <p className="relative mt-6 max-w-lg text-[1.05rem] leading-relaxed text-slate-300 text-pretty md:text-[1.1rem]">
            Un bot que comparte licencias, coordina pagos y activa accesos sin fricción.
            <br className="hidden sm:block" />
            Fondo oscuro, acentos cyan y una escena 3D que le da presencia a la landing.
          </p>

          <div className="relative mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button size="lg" className="w-full gap-2 rounded-xl bg-cyan-500 px-8 text-[1.02rem] font-bold text-white shadow-xl shadow-cyan-500/25 transition-all duration-200 hover:scale-105 hover:bg-cyan-400 sm:w-auto" asChild>
              <Link href="/login">
                Iniciar Sesión
                <ArrowRight size={16} />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full rounded-xl border-slate-600 bg-transparent px-8 text-[1.02rem] font-bold text-slate-200 backdrop-blur-md transition-all duration-200 hover:border-slate-400 hover:bg-white/5 sm:w-auto" asChild>
              <Link href="/register">Registrarse</Link>
            </Button>
          </div>

          <p className="relative mt-8 text-xs text-slate-400">
            Más de <span className="font-semibold text-white">2,400 freelancers</span> ya comparten licencias en CoStack
          </p>
        </div>

        <div className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2 animate-bounce md:left-[49%] lg:left-[50%]">
          <a href="#tools" className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-cyan-400 backdrop-blur-md transition-colors hover:bg-white/10 hover:text-cyan-300">
            <ChevronDown size={24} />
          </a>
        </div>
      </div>
    </section>
  )
}