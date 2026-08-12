'use client'

import { useEffect, useRef } from 'react'

/**
 * Eclipse Vercel em CSS puro:
 *  - o objeto é um recorte com alpha, opaco, SEM nenhuma luz assada;
 *  - atrás dele vive um flare branco forte, com o núcleo posicionado atrás
 *    do bloco, então o próprio objeto tapa o centro e a luz só vaza pelas
 *    bordas da silhueta;
 *  - o flare persegue o mouse com inércia (o vazamento muda de lado) e
 *    respira sozinho quando o mouse para.
 */
export default function HeroLuz({
  src,
  alt,
}: {
  src: string
  alt: string
}) {
  const flare = useRef<HTMLDivElement>(null)
  const img = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let ax = 0
    let ay = 0
    let cx = 0
    let cy = 0
    let t = 0
    let raf = 0

    const onMove = (e: PointerEvent | MouseEvent) => {
      ax = (e.clientX / window.innerWidth) * 2 - 1
      ay = (e.clientY / window.innerHeight) * 2 - 1
    }

    const loop = () => {
      t += 0.006
      cx += (ax - cx) * 0.035
      cy += (ay - cy) * 0.035

      const respira = 0.9 + Math.sin(t) * 0.1

      if (flare.current) {
        flare.current.style.transform = `translate3d(${cx * 9}%, ${cy * 6}%, 0) scale(${respira})`
      }
      if (img.current) {
        img.current.style.transform = `translate3d(${cx * -0.8}%, ${cy * -0.5}%, 0)`
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
      <div className="p7-luz-flare" ref={flare} aria-hidden="true" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} ref={img} className="p7-luz-img" />
    </div>
  )
}
