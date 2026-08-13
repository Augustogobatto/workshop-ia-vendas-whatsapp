'use client'

import { useEffect, useRef } from 'react'

/**
 * Vídeo de seção: a rolagem conduz a cena do primeiro ao último frame.
 *  - modo padrão: respiração perpétua por cima, nunca congela.
 *  - `cauda`: a rolagem DESTRAVA a cena, que aí corre sozinha no ritmo
 *    natural (playback nativo, sem seek) até o fim e fica em loop no trecho
 *    final. Subir a página rebobina; ao parar, ela retoma sozinha.
 * Exige vídeo ALL-INTRA (keyint=1) pra seek barato.
 */
export default function SectionScrub({
  src,
  poster,
  alt,
  className,
  style,
  cauda,
}: {
  src: string
  poster: string
  alt: string
  className?: string
  style?: React.CSSProperties
  cauda?: boolean
}) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = ref.current
    if (!v) return

    let dur = 0
    let pronto = false
    let raf = 0
    let cur = 0
    let escrito = -1
    let fase = Math.random() * Math.PI * 2 // respiração perpétua, dessincronizada
    const AMP = 0.09 // fração do vídeo que a respiração cobre
    const INICIO_CAUDA = 0.8 // onde o loop do fim começa
    let pAnterior = 0
    let rebobinando = 0 // segundos de carência depois de subir a página
    let antes = performance.now()

    const reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduz) return // fica no pôster, sem movimento

    const armar = () => {
      if (pronto) return
      dur = v.duration || 0
      if (!dur || !isFinite(dur)) return
      pronto = true
    }

    v.addEventListener('loadedmetadata', armar)
    v.addEventListener('canplay', armar)
    if (v.readyState >= 1) armar()

    const loop = (agora: number) => {
      let dt = (agora - antes) / 1000
      antes = agora
      if (dt > 1 / 30) dt = 1 / 30

      if (pronto && dur) {
        // progresso do elemento na viewport: 0 = topo dele encostando embaixo,
        // 1 = base dele saindo por cima
        const r = v.getBoundingClientRect()
        const vh = window.innerHeight
        let p = (vh - r.top) / (vh + r.height)
        p = p < 0 ? 0 : p > 1 ? 1 : p

        fase += 0.5 * dt

        if (cauda) {
          // rebobina enquanto a pessoa sobe a página
          if (p < pAnterior - 0.001) {
            if (!v.paused) v.pause()
            rebobinando = 0.25
            cur += (p * (dur - 0.05) - cur) * (1 - Math.exp(-9 * dt))
            if (!v.seeking && Math.abs(cur - escrito) >= 1 / 30) {
              escrito = cur
              try {
                v.currentTime = cur
              } catch {}
            }
          } else {
            rebobinando -= dt
            // destrava quando entra na tela e a partir daí corre sozinha
            if (rebobinando <= 0 && p > 0.06 && v.paused) {
              v.play().catch(() => {})
            }
            // fim da cena: o trecho final roda em loop
            if (v.currentTime >= dur - 0.06) {
              try {
                v.currentTime = INICIO_CAUDA * dur
              } catch {}
            }
            cur = v.currentTime
            escrito = cur
          }
          pAnterior = p
          raf = requestAnimationFrame(loop)
          return
        }

        // a rolagem escolhe o trecho; a respiração nunca deixa parar
        let f = AMP + p * (1 - 2 * AMP) + AMP * Math.sin(fase)
        f = f < 0 ? 0 : f > 1 ? 1 : f
        const alvo = f * (dur - 0.05)
        // perseguição rápida: acompanha o dedo/roda sem parecer travado
        cur += (alvo - cur) * (1 - Math.exp(-9 * dt))

        if (!v.seeking && Math.abs(cur - escrito) >= 1 / 30) {
          escrito = cur
          try {
            v.currentTime = cur
          } catch {}
        }
      }
      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)

    return () => {
      v.removeEventListener('loadedmetadata', armar)
      v.removeEventListener('canplay', armar)
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
