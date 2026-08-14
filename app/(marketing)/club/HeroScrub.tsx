'use client'

import { useEffect, useRef } from 'react'

/**
 * Hero em vídeo com fluxo perpétuo + scrub suave.
 *
 * Motor conforme pesquisa 12/08 (padrão Lenis/Apple):
 *  - o vídeo é ALL-INTRA (todo frame é keyframe), então cada seek decodifica
 *    um único quadro em vez de até doze;
 *  - eventos de mouse/scroll NUNCA tocam no vídeo: só injetam velocidade/alvo;
 *  - um único loop de rAF integra tudo com damping exponencial dependente de
 *    deltaTime (frame-rate independent), então 60Hz e 120Hz respondem igual;
 *  - o tempo só é escrito no vídeo quando muda pelo menos 1 frame (~30fps) e
 *    quando o seek anterior já terminou: pouquíssimos seeks, todos baratos.
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

    let dur = 0
    let pronto = false
    let tocou = false
    let raf = 0

    const reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // estado do motor: pêndulo perpétuo + scroll + empurrão de mouse por
    // velocidade (opção B, rodando limpa pela 1ª vez após remover o fantasma)
    let fase = 0 // pêndulo perpétuo
    let velMouse = 0 // velocidade injetada pelo gesto (fração do arco/s)
    let desvio = 0 // desvio acumulado, escorre de volta pro fluxo
    let empScroll = 0
    let syAlvo = 0
    let syAtual = 0
    let cur = 0 // tempo corrente que a gente persegue (s)
    let escrito = -1 // último tempo efetivamente escrito no vídeo
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
      // o gesto vira velocidade, nunca posição: flick empurra, a cena desliza
      velMouse += (e.movementX / window.innerWidth) * 1.2
      if (velMouse > 0.6) velMouse = 0.6
      if (velMouse < -0.6) velMouse = -0.6
    }

    const onScroll = () => {
      if (tocou) return
      const rolagem = Math.min(1, window.scrollY / (window.innerHeight * 1.2))
      empScroll = rolagem * 0.14
      syAlvo = Math.min(window.scrollY, window.innerHeight) * 0.08
    }

    // celular sem mouse: loop simples
    const onTouch = () => {
      if (tocou) return
      tocou = true
      v.loop = true
      v.play().catch(() => {})
    }

    const loop = (agora: number) => {
      let dt = (agora - antes) / 1000
      antes = agora
      if (dt > 1 / 30) dt = 1 / 30 // clampa saltos (troca de aba etc.)

      if (pronto && dur && !tocou) {
        // pêndulo perpétuo
        if (!reduz) fase += 0.32 * dt
        const base = 0.5 + 0.3 * Math.sin(fase)

        // física do empurrão: velocidade decai, desvio escorre de volta
        desvio += velMouse * dt
        velMouse *= Math.exp(-2.5 * dt)
        desvio *= Math.exp(-0.8 * dt)
        if (desvio > 0.18) desvio = 0.18
        if (desvio < -0.18) desvio = -0.18

        let f = base + desvio + empScroll
        f = f < 0.02 ? 0.02 : f > 0.98 ? 0.98 : f

        // damping exponencial frame-rate independent (padrão Lenis)
        const alvo = f * dur
        cur += (alvo - cur) * (1 - Math.exp(-7 * dt))

        // escreve no vídeo só quando muda >= 1 frame e o seek anterior acabou
        if (!v.seeking && Math.abs(cur - escrito) >= 1 / 30) {
          escrito = cur
          try {
            v.currentTime = cur
          } catch {}
        }

        // paralaxe com a mesma maciez
        syAtual += (syAlvo - syAtual) * (1 - Math.exp(-6 * dt))
        v.style.transform = `scale(1.14) translate3d(0, ${syAtual.toFixed(1)}px, 0)`
      }
      raf = requestAnimationFrame(loop)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('touchstart', onTouch, { passive: true })
    raf = requestAnimationFrame(loop)

    return () => {
      v.removeEventListener('loadedmetadata', armar)
      v.removeEventListener('canplay', armar)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('touchstart', onTouch)
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
    </div>
  )
}
