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
      // mouse dá o ângulo base; o scroll empurra o arco um pouco mais
      const rolagem = Math.min(1, window.scrollY / (window.innerHeight * 1.2))
      let f = mouseT + (rolagem - 0.15) * 0.35
      f = f < 0 ? 0 : f > 1 ? 1 : f
      alvo = f * dur
    }

    const onMove = (e: PointerEvent | MouseEvent) => {
      if (tocou) return
      let f = e.clientX / window.innerWidth
      mouseT = f < 0 ? 0 : f > 1 ? 1 : f
      mira()
    }

    const onScroll = () => {
      if (tocou) return
      mira()
      // paralaxe leve: a cena sobe mais devagar que a página
      if (ref.current) {
        const sy = Math.min(window.scrollY, window.innerHeight) * 0.08
        ref.current.style.transform = `scale(1.14) translate3d(0, ${sy.toFixed(1)}px, 0)`
      }
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
        atual += (alvo - atual) * (reduz ? 1 : 0.12)
        if (Math.abs(alvo - atual) > 0.004) {
          try {
            v.currentTime = atual
          } catch {}
        }
      }
      void ts
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
