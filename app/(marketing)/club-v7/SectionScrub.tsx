'use client'

import { useEffect, useRef } from 'react'

/**
 * Vídeo de seção com o mesmo motor do hero: fluxo perpétuo em vai-e-vem
 * + empurrão do mouse por velocidade. Exige vídeo ALL-INTRA (keyint=1).
 * Sem scroll/paralaxe: isso é só do hero.
 */
export default function SectionScrub({
  src,
  poster,
  alt,
  className,
  style,
}: {
  src: string
  poster: string
  alt: string
  className?: string
  style?: React.CSSProperties
}) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = ref.current
    if (!v) return

    let dur = 0
    let pronto = false
    let tocou = false
    let raf = 0

    const reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let fase = Math.random() * Math.PI * 2 // cada vídeo nasce num ponto do arco
    let velMouse = 0
    let desvio = 0
    let cur = 0
    let escrito = -1
    let antes = performance.now()

    const armar = () => {
      if (pronto) return
      dur = v.duration || 0
      if (!dur || !isFinite(dur)) return
      pronto = true
      cur = dur / 2
      try {
        v.currentTime = cur
      } catch {}
    }

    v.addEventListener('loadedmetadata', armar)
    v.addEventListener('canplay', armar)
    if (v.readyState >= 1) armar()

    const onMove = (e: PointerEvent) => {
      if (tocou) return
      velMouse += (e.movementX / window.innerWidth) * 1.2
      if (velMouse > 0.6) velMouse = 0.6
      if (velMouse < -0.6) velMouse = -0.6
    }

    // celular: loop nativo, sem scrub
    const onTouch = () => {
      if (tocou) return
      tocou = true
      v.loop = true
      v.play().catch(() => {})
    }

    const loop = (agora: number) => {
      let dt = (agora - antes) / 1000
      antes = agora
      if (dt > 1 / 30) dt = 1 / 30

      if (pronto && dur && !tocou) {
        if (!reduz) fase += 0.32 * dt
        const base = 0.5 + 0.34 * Math.sin(fase)

        desvio += velMouse * dt
        velMouse *= Math.exp(-2.5 * dt)
        desvio *= Math.exp(-0.8 * dt)
        if (desvio > 0.18) desvio = 0.18
        if (desvio < -0.18) desvio = -0.18

        let f = base + desvio
        f = f < 0.02 ? 0.02 : f > 0.98 ? 0.98 : f

        const alvo = f * dur
        cur += (alvo - cur) * (1 - Math.exp(-7 * dt))

        if (!v.seeking && Math.abs(cur - escrito) >= 1 / 30) {
          escrito = cur
          try {
            v.currentTime = cur
          } catch {}
        }
      }
      raf = requestAnimationFrame(loop)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('touchstart', onTouch, { passive: true })
    raf = requestAnimationFrame(loop)

    return () => {
      v.removeEventListener('loadedmetadata', armar)
      v.removeEventListener('canplay', armar)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('touchstart', onTouch)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      playsInline
      preload="auto"
      aria-label={alt}
      className={className}
      style={style}
    />
  )
}
