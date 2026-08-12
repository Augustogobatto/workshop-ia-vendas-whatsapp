'use client'

import { useEffect, useRef } from 'react'

/**
 * Hero no estilo Vercel: o objeto fica praticamente parado e quem se mexe
 * é a LUZ. Um halo atrás da imagem acompanha o mouse com bastante inércia,
 * e a imagem ganha um deslocamento mínimo no sentido contrário, o que dá
 * a sensação de volume sem virar carrossel de efeito.
 */
export default function HeroLuz({
  src,
  alt,
}: {
  src: string
  alt: string
}) {
  const halo = useRef<HTMLDivElement>(null)
  const img = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // alvo e posição atual, em fração de -1 a 1
    let ax = 0
    let ay = 0
    let cx = 0
    let cy = 0
    let raf = 0

    const onMove = (e: PointerEvent | MouseEvent) => {
      ax = (e.clientX / window.innerWidth) * 2 - 1
      ay = (e.clientY / window.innerHeight) * 2 - 1
    }

    const loop = () => {
      // inércia alta: a luz demora a chegar, fica pesada
      cx += (ax - cx) * 0.035
      cy += (ay - cy) * 0.035

      if (halo.current) {
        // o halo caminha bem mais que a imagem
        halo.current.style.transform = `translate3d(${cx * 22}%, ${cy * 14}%, 0)`
        // e respira de intensidade conforme se aproxima do centro
        const dist = Math.min(1, Math.hypot(cx, cy))
        halo.current.style.opacity = String(0.55 + (1 - dist) * 0.45)
      }
      if (img.current) {
        img.current.style.transform = `translate3d(${cx * -0.9}%, ${cy * -0.7}%, 0)`
      }
      raf = requestAnimationFrame(loop)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('mousemove', onMove, { passive: true })
    raf = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="p7-luz">
      <div className="p7-luz-halo" ref={halo} aria-hidden="true" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} ref={img} className="p7-luz-img" />
    </div>
  )
}
