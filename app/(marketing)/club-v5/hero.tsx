'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Syncopate, IBM_Plex_Mono } from 'next/font/google'
import Gate from './gate'

const syncopate = Syncopate({ subsets: ['latin'], weight: ['400', '700'] })
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'] })

const STRIPE_MENSAL = 'https://buy.stripe.com/5kQ00k91qeVL2ve9JG9fW0f'

const TICKER =
  'R$140 MIL VENDIDOS POR UMA IA ✦ R$300 MIL NO LANÇAMENTO SEGUINTE ✦ 10 ASSISTENTES RODANDO AGORA ✦ 0 PROGRAMADORES CONTRATADOS ✦ '

// um filamento do tecido de luz
type Thread = {
  base: number // posição vertical base (fração da tela)
  amp1: number
  amp2: number
  k1: number
  k2: number
  p1: number
  p2: number
  s1: number
  s2: number
  hue: 'silver' | 'ember'
  alpha: number
  width: number
}

const HalideHero: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gate, setGate] = useState<'unknown' | 'closed' | 'open'>('unknown')

  useEffect(() => {
    // O ritual acontece em toda visita — sem atalhos.
    // (Pra voltar a pular pra quem já empurrou: checar localStorage 'pushclub_gate' aqui.)
    setGate('closed')
  }, [])

  const openGate = () => {
    try {
      localStorage.setItem('pushclub_gate', 'ok')
    } catch {}
    setGate('open')
  }

  // ── tecido de luz: filamentos entrelaçados que o cursor dobra ──
  useEffect(() => {
    if (gate !== 'open') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0
    let h = 0
    let raf = 0
    let t = Math.random() * 100
    const mouse = { x: -9999, y: -9999 }
    const smooth = { x: -9999, y: -9999 } // cursor suavizado — o tecido reage com inércia
    let threads: Thread[] = []

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const seed = () => {
      threads = []
      // três cordas tecidas, cada uma com dezenas de filamentos irmãos
      const ribbons = [
        { base: 0.3, spread: 0.05, count: 22 },
        { base: 0.56, spread: 0.07, count: 26 },
        { base: 0.8, spread: 0.045, count: 18 },
      ]
      ribbons.forEach((r, ri) => {
        for (let i = 0; i < r.count; i++) {
          const f = i / r.count
          const ember = (i + ri) % 9 === 0 // 1 em cada ~9 fios é brasa laranja
          threads.push({
            base: r.base + (f - 0.5) * r.spread * 2,
            amp1: 34 + Math.sin(f * Math.PI) * 46,
            amp2: 12 + f * 26,
            k1: 0.0035 + ri * 0.0011 + f * 0.0009,
            k2: 0.0082 - f * 0.0022,
            p1: f * Math.PI * 2 + ri * 1.7,
            p2: f * Math.PI * 5 + ri * 0.9,
            s1: 0.28 + f * 0.22,
            s2: 0.42 - f * 0.18,
            hue: ember ? 'ember' : 'silver',
            alpha: ember ? 0.075 : 0.028 + f * 0.03,
            width: ember ? 1.1 : 0.7,
          })
        }
      })
    }

    const STEP = 26 // resolução horizontal dos filamentos
    const WARP = 190 // raio em que o cursor dobra o tecido

    const frame = () => {
      // fundo com leve rastro: o tecido deixa fantasma de movimento
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = 'rgba(10,10,10,.5)'
      ctx.fillRect(0, 0, w, h)

      // cursor com inércia
      if (mouse.x > -9000) {
        smooth.x += (mouse.x - smooth.x) * 0.07
        smooth.y += (mouse.y - smooth.y) * 0.07
      }

      // luz aditiva: onde os fios se cruzam, brilha
      ctx.globalCompositeOperation = 'lighter'

      if (!reduced) t += 0.016

      for (const th of threads) {
        const baseY = th.base * h
        ctx.strokeStyle =
          th.hue === 'ember' ? `rgba(255,72,10,${th.alpha})` : `rgba(214,220,228,${th.alpha})`
        ctx.lineWidth = th.width
        ctx.beginPath()
        for (let x = -STEP; x <= w + STEP; x += STEP) {
          let y =
            baseY +
            Math.sin(x * th.k1 + th.p1 + t * th.s1) * th.amp1 +
            Math.sin(x * th.k2 + th.p2 - t * th.s2) * th.amp2

          // o cursor afunda o tecido — como uma mão passando por dentro
          const dx = x - smooth.x
          const dy = y - smooth.y
          const d2 = dx * dx + dy * dy
          if (d2 < WARP * WARP * 4) {
            const d = Math.sqrt(d2) || 1
            const push = Math.exp(-(d * d) / (WARP * WARP)) * 52
            y += (dy / d) * push
          }

          if (x === -STEP) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
      }

      raf = requestAnimationFrame(frame)
    }

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
      if (smooth.x < -9000) {
        smooth.x = e.clientX
        smooth.y = e.clientY
      }
    }
    const onLeave = () => {
      mouse.x = -9999
      mouse.y = -9999
    }
    const onResize = () => {
      resize()
      seed()
    }

    resize()
    seed()
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, w, h)
    raf = requestAnimationFrame(frame)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseout', onLeave)
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseout', onLeave)
      window.removeEventListener('resize', onResize)
    }
  }, [gate])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --bg: #0a0a0a;
          --silver: #e0e0e0;
          --dim: rgba(224,224,224,.42);
          --faint: rgba(224,224,224,.22);
          --accent: #ff3c00;
        }

        .h5 {
          position: fixed; inset: 0;
          background: var(--bg); color: var(--silver);
          overflow: hidden;
        }

        .h5-grain { position: fixed; inset: 0; pointer-events: none; z-index: 100; opacity: .13; }
        .h5-canvas { position: absolute; inset: 0; display: block; }

        /* sussurros nos cantos */
        .h5-corner {
          position: absolute; z-index: 10;
          font-size: .66rem; letter-spacing: .12em;
          color: var(--faint); pointer-events: none;
        }
        .h5-corner.tl { top: 1.6rem; left: 2rem; }
        .h5-corner.tr { top: 1.6rem; right: 2rem; color: var(--accent); opacity: .75; }
        .h5-corner b { color: var(--dim); font-weight: 500; }

        /* monumento central */
        .h5-center {
          position: absolute; inset: 0; z-index: 10;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center; padding: 0 1.4rem;
          pointer-events: none;
        }
        .h5-center a, .h5-center .h5-note { pointer-events: auto; }

        .h5-kicker {
          font-size: .7rem; letter-spacing: .2em; color: var(--dim);
          margin-bottom: 2.2rem;
        }
        .h5-kicker b { color: var(--silver); font-weight: 500; }

        .h5-title {
          font-weight: 700; text-transform: uppercase;
          font-size: clamp(2.4rem, 7.6vw, 6.6rem);
          line-height: 1; letter-spacing: .01em;
          white-space: nowrap;
        }
        .h5-title .club { color: transparent; -webkit-text-stroke: 1px rgba(224,224,224,.55); }

        .h5-tl { overflow: hidden; display: block; padding-top: .14em; margin-top: -.14em; }
        .h5-tl span { display: block; transform: translateY(112%); transition: transform 1.1s cubic-bezier(.16,1,.3,1); }
        .h5.on .h5-tl span { transform: none; }

        .h5-sub {
          margin-top: 2.4rem; max-width: 56ch;
          font-size: .8rem; line-height: 1.85; letter-spacing: .04em;
          color: var(--dim);
        }
        .h5-sub strong { color: var(--silver); font-weight: 500; display: block; margin-bottom: .5rem; }

        .h5-cta {
          margin-top: 2.8rem;
          background: var(--silver); color: var(--bg);
          padding: 1.05rem 2.8rem; text-decoration: none;
          font-weight: 700; font-size: .78rem; letter-spacing: .16em;
          clip-path: polygon(0 0, 100% 0, 100% 70%, 93% 100%, 0 100%);
          transition: background .25s, color .25s, transform .25s;
        }
        .h5-cta:hover { background: var(--accent); color: #fff; transform: translateY(-4px); }

        .h5-note {
          margin-top: 1.3rem;
          font-size: .64rem; letter-spacing: .16em; line-height: 2;
          color: var(--faint);
        }

        /* reveals */
        .h5 .rv { opacity: 0; transform: translateY(18px); transition: opacity .9s ease, transform .9s cubic-bezier(.16,1,.3,1); }
        .h5.on .rv { opacity: 1; transform: none; }
        .h5.on .rv1 { transition-delay: .1s; }
        .h5.on .rv2 { transition-delay: .45s; }
        .h5.on .rv3 { transition-delay: .65s; }
        .h5-canvas { opacity: 0; transition: opacity 1.6s ease .4s; }
        .h5.on .h5-canvas { opacity: 1; }

        /* ticker de números reais, quase sussurrado, no rodapé */
        .h5-ticker {
          position: absolute; left: 0; right: 0; bottom: 0; z-index: 10;
          border-top: 1px solid rgba(224,224,224,.08);
          overflow: hidden;
          font-size: .62rem; letter-spacing: .18em; color: var(--faint);
          padding: .75rem 0;
        }
        .h5-ticker > div { display: flex; white-space: nowrap; animation: h5tape 48s linear infinite; }
        .h5-ticker span { padding-right: .9em; }
        .h5-ticker i { font-style: normal; color: var(--accent); opacity: .6; }
        @keyframes h5tape { from { transform: translateX(0); } to { transform: translateX(-50%); } }

        @media (max-width: 700px) {
          .h5-title { font-size: clamp(2rem, 11.5vw, 3.4rem); }
          .h5-corner.tl { display: none; }
          .h5-corner.tr { left: 1.4rem; right: auto; }
          .h5-sub { font-size: .74rem; }
        }

        @media (prefers-reduced-motion: reduce) {
          .h5-ticker > div { animation: none; }
          .h5 .rv, .h5-tl span, .h5-canvas { transition: none; }
        }
      ` }} />

      <div className={`h5 ${syncopate.className} ${gate === 'open' ? 'on' : ''}`}>
        <svg style={{ position: 'absolute', width: 0, height: 0 }}>
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </svg>
        <div className="h5-grain" style={{ filter: 'url(#grain)' }}></div>

        {gate === 'closed' && <Gate onOpen={openGate} />}

        {/* a máquina escondida */}
        <canvas ref={canvasRef} className="h5-canvas" aria-hidden="true"></canvas>

        {/* carimbo */}
        <div className={`h5-corner tr ${plexMono.className}`}>[ EXPERIMENTO Nº 001 — AO VIVO ]</div>

        {/* monumento */}
        <div className="h5-center">
          <h1 className="h5-title">
            <span className="h5-tl">
              <span>
                PUSH <span className="club">CLUB</span>
              </span>
            </span>
          </h1>

          <p className={`h5-sub rv rv2 ${plexMono.className}`}>
            <strong>Chega de falação sobre IA. Aqui você vê ela colocando dinheiro no bolso.</strong>
            Uma empresa onde só trabalha uma pessoa + IA — e você vendo tudo por dentro.
          </p>

          <a className={`h5-cta rv rv3`} href={STRIPE_MENSAL}>
            ENTRAR NO PUSH CLUB →
          </a>
          <span className={`h5-note rv rv3 ${plexMono.className}`}>R$70/MÊS · SEM FIDELIDADE</span>
        </div>

        {/* números reais, sussurrados */}
        <div className={`h5-ticker ${plexMono.className}`} aria-hidden="true">
          <div>
            <span>
              {TICKER.split('✦').map((t, i) => (
                <React.Fragment key={i}>
                  {t}
                  {i < TICKER.split('✦').length - 1 && <i>✦</i>}
                </React.Fragment>
              ))}
            </span>
            <span>
              {TICKER.split('✦').map((t, i) => (
                <React.Fragment key={i}>
                  {t}
                  {i < TICKER.split('✦').length - 1 && <i>✦</i>}
                </React.Fragment>
              ))}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

export default HalideHero
