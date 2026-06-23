'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

type HeroCursorGlowProps = {
  size?: number
}

export function HeroCursorGlow({ size = 420 }: HeroCursorGlowProps) {
  const glowRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0, active: false })

  const style = useMemo(
    () => ({
      background: `radial-gradient(circle ${size / 2}px at ${position.x}px ${position.y}px, rgba(34, 211, 238, 0.14), rgba(6, 182, 212, 0.07) 28%, rgba(10, 15, 30, 0) 68%)`,
      opacity: position.active ? 1 : 0,
    }),
    [position.active, position.x, position.y, size]
  )

  useEffect(() => {
    const element = glowRef.current
    const parent = element?.parentElement

    if (!parent) {
      return
    }

    const updateSceneGlow = (x: number) => {
      const rect = parent.getBoundingClientRect()
      const normalizedX = rect.width ? x / rect.width : 0.5

      parent.style.setProperty('--hero-gaze-left', `${Math.max(12, Math.min(68, normalizedX * 68))}%`)
      parent.style.setProperty('--hero-eye-offset', `${((normalizedX - 0.5) * 18).toFixed(1)}px`)
      parent.style.setProperty('--hero-gaze-alpha', '1')
    }

    const clearSceneGlow = () => {
      parent.style.setProperty('--hero-gaze-left', '55%')
      parent.style.setProperty('--hero-eye-offset', '0px')
      parent.style.setProperty('--hero-gaze-alpha', '0')
    }

    const updatePosition = (event: PointerEvent) => {
      const rect = parent.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      setPosition({ x, y, active: true })
      updateSceneGlow(x)
    }

    const handleEnter = (event: PointerEvent) => {
      updatePosition(event)
    }

    const handleLeave = () => {
      setPosition((current) => ({ ...current, active: false }))
      clearSceneGlow()
    }

    parent.addEventListener('pointermove', updatePosition)
    parent.addEventListener('pointerenter', handleEnter)
    parent.addEventListener('pointerleave', handleLeave)

    return () => {
      parent.removeEventListener('pointermove', updatePosition)
      parent.removeEventListener('pointerenter', handleEnter)
      parent.removeEventListener('pointerleave', handleLeave)
      clearSceneGlow()
    }
  }, [])

  return (
    <div
      ref={glowRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[1] mix-blend-screen transition-opacity duration-200"
      style={style}
    />
  )
}