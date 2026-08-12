'use client'

import { useEffect, useRef } from 'react'

/**
 * Hero em vídeo com scrub pelo mouse (técnica Resend/Apple):
 * o vídeo é um giro de 360 do objeto, e a posição horizontal do mouse
 * define o tempo do vídeo. Cada quadro é um ângulo, então o efeito é
 * girar o objeto na mão, com a qualidade da foto de estúdio.
 */
export default function HeroScrub({
  src,
  poster,
  alt,
}: {
  src: string
  poster: string
  alt: string
}) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = ref.current
    if (!v) return

    let alvo = 0
    let atual = 0
    let dur = 0
    let pronto = false
    let tocou = false
    let raf = 0

    const reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const armar = () => {
      if (pronto) return
      dur = v.duration || 0
      if (!dur || !isFinite(dur)) return
      pronto = true
      // começa no meio do arco (ângulo central); o mouse abre pros lados
      alvo = dur / 2
      atual = dur / 2
      try {
        v.currentTime = dur / 2
      } catch {}
    }

    const onMove = (e: PointerEvent | MouseEvent) => {
      if (!pronto || !dur || tocou) return
      let f = e.clientX / window.innerWidth
      f = f < 0 ? 0 : f > 1 ? 1 : f
      alvo = f * dur
    }

    // sem mouse (celular): deixa rodando em loop
    const onTouch = () => {
      if (tocou) return
      tocou = true
      v.loop = true
      v.play().catch(() => {})
    }

    const loop = () => {
      if (pronto && dur && !tocou) {
        atual += (alvo - atual) * (reduz ? 1 : 0.12)
        if (Math.abs(alvo - atual) > 0.004) {
          try {
            v.currentTime = atual
          } catch {}
        }
      }
      raf = requestAnimationFrame(loop)
    }

    v.addEventListener('loadedmetadata', armar)
    v.addEventListener('canplay', armar)
    if (v.readyState >= 1) armar()

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('touchstart', onTouch, { passive: true })
    raf = requestAnimationFrame(loop)

    return () => {
      v.removeEventListener('loadedmetadata', armar)
      v.removeEventListener('canplay', armar)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchstart', onTouch)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <video
      ref={ref}
      id="p7scrub"
      src={src}
      poster={poster}
      muted
      playsInline
      preload="auto"
      aria-label={alt}
      style={{ width: '100%', display: 'block', aspectRatio: '1 / 1', objectFit: 'cover' }}
    />
  )
}
