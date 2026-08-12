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
    let mouseT = 0.5 // fração 0..1 vinda do mouse
    let ultimoGesto = 0 // timestamp da última interação
    let ocioso = false
    let fase = 0 // fase da deriva ociosa

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

    const mira = () => {
      if (!pronto || !dur) return
      // mouse dá o ângulo base (comprimido: não usa o arco inteiro de uma vez);
      // o scroll empurra um pouco mais, também suavizado
      const rolagem = Math.min(1, window.scrollY / (window.innerHeight * 1.2))
      let f = 0.5 + (mouseT - 0.5) * 0.72 + (rolagem - 0.15) * 0.2
      f = f < 0 ? 0 : f > 1 ? 1 : f
      alvo = f * dur
    }

    const onMove = (e: PointerEvent | MouseEvent) => {
      if (tocou) return
      ultimoGesto = performance.now()
      ocioso = false
      let f = e.clientX / window.innerWidth
      mouseT = f < 0 ? 0 : f > 1 ? 1 : f
      mira()
    }

    let syAlvo = 0
    let syAtual = 0

    const onScroll = () => {
      if (tocou) return
      ultimoGesto = performance.now()
      ocioso = false
      mira()
      // paralaxe leve, aplicada com inércia no loop (nunca de forma seca)
      syAlvo = Math.min(window.scrollY, window.innerHeight) * 0.08
    }

    // sem mouse (celular): deixa rodando em loop
    const onTouch = () => {
      if (tocou) return
      tocou = true
      v.loop = true
      v.play().catch(() => {})
    }

    const loop = (ts: number) => {
      if (pronto && dur && !tocou) {
        // sem gesto por 2,5s: deriva lenta em vai-e-vem pelo arco
        if (!reduz && ts - ultimoGesto > 2500) {
          if (!ocioso) {
            ocioso = true
            // entra na deriva a partir do ângulo atual, sem pulo
            const norm = Math.max(-1, Math.min(1, (atual / dur - 0.5) / 0.38))
            fase = Math.asin(norm)
          }
          fase += 0.0035
          alvo = dur * (0.5 + 0.38 * Math.sin(fase))
        }
        // perseguição bem mais lenta: o ângulo flui atrás do gesto sem tranco
        atual += (alvo - atual) * (reduz ? 1 : 0.045)
        if (Math.abs(alvo - atual) > 0.004) {
          try {
            v.currentTime = atual
          } catch {}
        }
        // paralaxe com a mesma maciez
        syAtual += (syAlvo - syAtual) * 0.06
        if (Math.abs(syAlvo - syAtual) > 0.1) {
          v.style.transform = `scale(1.14) translate3d(0, ${syAtual.toFixed(1)}px, 0)`
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
    window.addEventListener('scroll', onScroll, { passive: true })
    raf = requestAnimationFrame(loop)

    return () => {
      v.removeEventListener('loadedmetadata', armar)
      v.removeEventListener('canplay', armar)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchstart', onTouch)
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div style={{ position: 'relative' }}>
    <video
      ref={ref}
      id="p7scrub"
      src={src}
      poster={poster}
      muted
      playsInline
      preload="auto"
      aria-label={alt}
      style={{
        width: '100%',
        display: 'block',
        aspectRatio: '1 / 1',
        objectFit: 'cover',
        // zoom leve empurra as bordas originais pra fora da zona visível
        transform: 'scale(1.14)',
        // fade mais cedo e mais longo: nenhum frame do arco alcança a borda
        WebkitMaskImage:
          'radial-gradient(ellipse 68% 68% at 50% 50%, #000 40%, rgba(0,0,0,0.55) 62%, transparent 86%)',
        maskImage:
          'radial-gradient(ellipse 68% 68% at 50% 50%, #000 40%, rgba(0,0,0,0.55) 62%, transparent 86%)',
      }}
    />
    {/* grão removido a pedido (12/08): sujava a máscara; o vídeo já tem grão próprio */}
    </div>
  )
}
