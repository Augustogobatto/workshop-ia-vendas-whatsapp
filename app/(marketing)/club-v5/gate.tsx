'use client'

import React, { useEffect, useRef, useState } from 'react'

type Shard = { clip: string; dx: string; dy: string; rot: string; delay: string }

const SHARDS: Shard[] = [
  { clip: 'polygon(50% 50%, 50% 0%, 100% 0%, 66% 38%)', dx: '52px', dy: '-150px', rot: '42deg', delay: '0s' },
  { clip: 'polygon(50% 50%, 100% 0%, 100% 30%, 72% 55%)', dx: '160px', dy: '-70px', rot: '-28deg', delay: '.03s' },
  { clip: 'polygon(50% 50%, 100% 30%, 96% 68%, 62% 60%)', dx: '180px', dy: '40px', rot: '24deg', delay: '.06s' },
  { clip: 'polygon(50% 50%, 96% 68%, 100% 100%, 55% 64%)', dx: '120px', dy: '150px', rot: '-36deg', delay: '.02s' },
  { clip: 'polygon(50% 50%, 100% 100%, 42% 100%, 44% 66%)', dx: '20px', dy: '180px', rot: '18deg', delay: '.08s' },
  { clip: 'polygon(50% 50%, 42% 100%, 0% 100%, 38% 58%)', dx: '-100px', dy: '160px', rot: '44deg', delay: '.04s' },
  { clip: 'polygon(50% 50%, 0% 100%, 0% 52%, 34% 46%)', dx: '-170px', dy: '70px', rot: '-30deg', delay: '.07s' },
  { clip: 'polygon(50% 50%, 0% 52%, 0% 0%, 36% 36%)', dx: '-155px', dy: '-70px', rot: '26deg', delay: '.01s' },
  { clip: 'polygon(50% 50%, 0% 0%, 50% 0%, 50% 0%)', dx: '-60px', dy: '-145px', rot: '-40deg', delay: '.05s' },
]

// Geometria medida na imagem push-button.png (1120px, valores em % do stage)
// Tampa (parte móvel): x 25%→75.5%, y 23.5%→76.5%, raio dos cantos ~12% do stage
const STAGE = 560
const CAP = { left: 140, top: 132, width: 283, height: 297, radius: 66 }
const IMG = '/push-button.png'

const Gate: React.FC<{ onOpen: () => void }> = ({ onOpen }) => {
  const wrapRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLDivElement>(null)

  const forceRef = useRef(0)
  const pressingRef = useRef(false)
  const brokenRef = useRef(false)
  const lastLabelRef = useRef('')
  const audioRef = useRef<AudioContext | null>(null)

  const [label, setLabel] = useState('pressione e segure')
  const [snapped, setSnapped] = useState(false)
  const [broken, setBroken] = useState(false)

  // ── Som sintetizado (sem arquivos): click de tecla e thock grave ──
  const getCtx = () => {
    if (!audioRef.current) {
      try {
        audioRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      } catch {}
    }
    return audioRef.current
  }

  const playNoise = (duration: number, freq: number, type: BiquadFilterType, vol: number) => {
    const ctx = getCtx()
    if (!ctx) return
    const frames = Math.floor(ctx.sampleRate * duration)
    const buffer = ctx.createBuffer(1, frames, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames)
    const src = ctx.createBufferSource()
    src.buffer = buffer
    const filter = ctx.createBiquadFilter()
    filter.type = type
    filter.frequency.value = freq
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(vol, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    src.connect(filter).connect(gain).connect(ctx.destination)
    src.start()
  }

  const clickSound = () => playNoise(0.04, 2400, 'bandpass', 0.12)
  const boomSound = () => playNoise(0.5, 110, 'lowpass', 0.75)
  const thockSound = () => {
    playNoise(0.09, 150, 'lowpass', 0.5)
    const ctx = getCtx()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.frequency.setValueAtTime(90, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.12)
    gain.gain.setValueAtTime(0.4, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14)
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.15)
  }
  const crackleSound = () => playNoise(0.3, 3200, 'highpass', 0.18)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // Constante de tempo: força chega a ~99.9% em ~4s de pressão contínua (independente do frame rate)
    const K = reduced ? 12 : 1.0
    let raf = 0
    let last = performance.now()

    const setLabelOnce = (text: string) => {
      if (lastLabelRef.current !== text) {
        lastLabelRef.current = text
        setLabel(text)
      }
    }

    const breakNow = () => {
      brokenRef.current = true
      const btn = btnRef.current
      const wrap = wrapRef.current

      // Ato 1 — SNAP: a tampa crava no fundo do poço
      if (btn) {
        btn.style.transition = 'transform .09s cubic-bezier(.4,0,1,1), filter .09s linear'
        btn.style.transform = 'translateY(34px)'
        btn.style.filter = 'brightness(.55)'
      }
      if (wrap) wrap.style.transform = ''
      setSnapped(true)
      thockSound()
      try {
        navigator.vibrate?.(120)
      } catch {}
      setLabelOnce(' ')

      // Ato 2 — EXPLOSÃO: impact frame preto + cacos acelerando pra fora da tela
      // + zoom da câmera pra dentro do buraco. Sem fade branco.
      setTimeout(() => {
        setBroken(true)
      }, 100)
      setTimeout(onOpen, 800)
    }

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      const pressing = pressingRef.current
      let f = forceRef.current

      if (!brokenRef.current) {
        f = pressing
          ? Math.min(1, f + (1.02 - f) * (1 - Math.exp(-K * dt)))
          : Math.max(0, f * Math.exp(-2.6 * dt) - 0.12 * dt)
        forceRef.current = f

        const btn = btnRef.current
        const wrap = wrapRef.current
        if (btn && wrap) {
          const shake = pressing && !reduced ? f * 5 : 0
          const sx = (Math.random() - 0.5) * shake
          const sy = (Math.random() - 0.5) * shake
          // Curso mecânico: a tampa (recorte da foto) desce e escurece conforme afunda
          btn.style.transform = `translate(${sx}px, ${f * 28 + sy}px)`
          btn.style.filter = `brightness(${1 - f * 0.28})`

          const rumble = !reduced && f > 0.6 ? (f - 0.6) * 9 : 0
          wrap.style.transform = rumble
            ? `translate(${(Math.random() - 0.5) * rumble}px, ${(Math.random() - 0.5) * rumble}px)`
            : ''
          wrap.dataset.stage = f > 0.9 ? '3' : f > 0.65 ? '2' : f > 0.35 ? '1' : '0'
        }

        if (pressing) {
          setLabelOnce(f > 0.6 ? 'continue.' : ' ')
        }

        if (f >= 0.999) breakNow()
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onOpen])

  const press = (e: React.PointerEvent) => {
    e.preventDefault()
    if (brokenRef.current) return
    pressingRef.current = true
    clickSound()
  }

  const release = () => {
    if (brokenRef.current || !pressingRef.current) return
    pressingRef.current = false
    if (forceRef.current > 0.15) {
      lastLabelRef.current = 'desistiu?'
      setLabel('desistiu?')
    }
  }

  return (
    <div
      ref={wrapRef}
      className={`gate ${snapped ? 'snap' : ''} ${broken ? 'broken' : ''}`}
      data-stage="0"
    >
      <style dangerouslySetInnerHTML={{ __html: `
        .gate {
          position: fixed; inset: 0; z-index: 200;
          background: #191617; color: #e0e0e0;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          user-select: none; -webkit-user-select: none;
        }
        /* Câmera mergulha pra dentro do buraco: zoom com aceleração, corte seco no fim */
        .gate.broken {
          pointer-events: none;
          animation: gate-zoom .6s cubic-bezier(.6,0,.9,.5) forwards;
        }
        @keyframes gate-zoom {
          0% { transform: scale(1); opacity: 1; }
          82% { opacity: 1; }
          100% { transform: scale(7); opacity: 0; }
        }

        .gate-grain {
          position: absolute; inset: 0; pointer-events: none;
          opacity: .15; filter: url(#grain); z-index: 5;
        }

        .gate-stage {
          position: relative; z-index: 2;
          width: ${STAGE}px; height: ${STAGE}px;
        }
        /* Camera shake: máximo em 2 frames, decai rápido */
        .broken .gate-stage { animation: gate-shake .35s linear; }
        @keyframes gate-shake {
          0% { transform: translate(0,0); }
          8% { transform: translate(16px,-12px); }
          20% { transform: translate(-14px,9px); }
          35% { transform: translate(10px,-7px); }
          50% { transform: translate(-7px,5px); }
          70% { transform: translate(4px,-3px); }
          100% { transform: translate(0,0); }
        }

        /* Foto completa do botão: soquete + tampa em repouso.
           O fundo da foto foi aplainado pra #191617 — mesma cor do fundo do portão. */
        .gate-base {
          position: absolute; inset: 0;
          background: url('${IMG}') center / ${STAGE}px ${STAGE}px no-repeat;
        }

        /* Buraco que fica quando a tampa some (aparece no estilhaço) */
        .gate-hole {
          position: absolute;
          left: ${CAP.left}px; top: ${CAP.top}px; width: ${CAP.width}px; height: ${CAP.height}px;
          border-radius: ${CAP.radius}px;
          background: #060606;
          box-shadow: inset 0 18px 40px rgba(0,0,0,.95), inset 0 -3px 8px rgba(255,255,255,.02);
          opacity: 0; transition: opacity .18s ease;
        }
        .broken .gate-hole { opacity: 1; }

        /* Tampa: recorte da mesma foto, alinhado pixel a pixel sobre a base */
        .gate-btn {
          position: absolute;
          left: ${CAP.left}px; top: ${CAP.top}px; width: ${CAP.width}px; height: ${CAP.height}px;
          border-radius: ${CAP.radius}px;
          background: url('${IMG}') no-repeat;
          background-size: ${STAGE}px ${STAGE}px;
          background-position: -${CAP.left}px -${CAP.top}px;
          cursor: pointer; touch-action: none;
          will-change: transform, filter;
        }
        .broken .gate-btn {
          background: none; cursor: default;
          animation: gate-explode .5s cubic-bezier(.45,0,1,.6) forwards;
          z-index: 4;
        }
        @keyframes gate-explode {
          0% { transform: translateY(34px) scale(1); }
          100% { transform: translateY(34px) scale(22); }
        }

        .gate-cracks { position: absolute; inset: 0; pointer-events: none; z-index: 2; }
        .gate-cracks polyline {
          fill: none; stroke: rgba(224,224,224,.55); stroke-width: 1.3;
          opacity: 0; transition: opacity .12s linear;
        }
        [data-stage="1"] .crack-a { opacity: .5; }
        [data-stage="2"] .crack-a, [data-stage="2"] .crack-b { opacity: .75; }
        [data-stage="3"] .crack-a, [data-stage="3"] .crack-b, [data-stage="3"] .crack-c { opacity: 1; }
        .snap .gate-cracks polyline { opacity: 1; }
        .broken .gate-cracks polyline { opacity: 0; }

        /* Jolt da tela no snap */
        .snap { animation: gate-jolt .18s ease-out; }
        @keyframes gate-jolt {
          0% { transform: translateY(0); }
          35% { transform: translateY(7px); }
          100% { transform: translateY(0); }
        }

        /* Estilhaços texturizados com a foto da tampa, com gravidade */
        .gate-shard {
          position: absolute; inset: 0;
          background: url('${IMG}') no-repeat;
          background-size: ${STAGE}px ${STAGE}px;
          background-position: -${CAP.left}px -${CAP.top}px;
          animation: gate-fly .5s cubic-bezier(.45,0,1,.6) var(--delay) forwards;
          z-index: 2;
        }
        /* Cacos ACELERAM até sair da tela, opacidade total — saem por geometria, não por fade */
        @keyframes gate-fly {
          0% { transform: translate(0,0) rotate(0); }
          100% { transform: translate(calc(var(--dx) * 2), calc(var(--dy) * 2)) rotate(calc(var(--rot) * 2)); }
        }

        /* Impact frame: 1 piscada preta de contraste no instante do estouro — sentida, não vista */
        .gate-impact {
          position: fixed; inset: 0; background: #000;
          opacity: 0; pointer-events: none; z-index: 6;
        }
        .broken .gate-impact { animation: gate-impact .09s linear; }
        @keyframes gate-impact { 0%, 65% { opacity: 1; } 100% { opacity: 0; } }

        .gate-label {
          margin-top: -2.4rem; font-family: monospace; font-size: .75rem; letter-spacing: .25em;
          min-height: 1.2em; color: #e0e0e0; opacity: .5; z-index: 2; text-align: center;
          animation: gate-pulse 2.8s ease-in-out infinite;
        }
        @keyframes gate-pulse { 0%,100% { opacity: .35; } 50% { opacity: .7; } }
        .gate.broken .gate-label { opacity: 0; animation: none; }

        @media (prefers-reduced-motion: reduce) {
          .gate.broken { animation: gate-zoom .25s linear forwards; }
          .broken .gate-stage, .broken .gate-impact { animation: none; }
          .broken .gate-btn, .gate-shard { animation: none; opacity: 0; }
        }

        @media (max-width: 640px) {
          .gate-stage { transform: scale(.62); margin: -${STAGE * 0.19}px 0; }
        }
      ` }} />

      <div className="gate-grain"></div>
      <div className="gate-impact"></div>

      <div className="gate-stage">
        <div className="gate-base"></div>
        <div className="gate-hole"></div>

        <div
          className="gate-btn"
          ref={btnRef}
          onPointerDown={press}
          onPointerUp={release}
          onPointerLeave={release}
          onPointerCancel={release}
          onContextMenu={(e) => e.preventDefault()}
        >
          {!broken && (
            <svg className="gate-cracks" viewBox={`0 0 ${CAP.width} ${CAP.height}`} preserveAspectRatio="none">
              <polyline className="crack-a" points="141,148 164,120 159,89 182,57 174,28" />
              <polyline className="crack-a" points="141,148 109,164 89,198 54,209" />
              <polyline className="crack-b" points="141,148 179,161 209,151 241,172" />
              <polyline className="crack-b" points="141,148 126,111 94,98 84,61" />
              <polyline className="crack-c" points="141,148 156,188 149,227 172,261" />
              <polyline className="crack-c" points="141,148 104,135 74,145 44,127" />
              <polyline className="crack-c" points="141,148 166,140 194,114 226,103" />
            </svg>
          )}

          {broken &&
            SHARDS.map((s, i) => (
              <div
                key={i}
                className="gate-shard"
                style={
                  {
                    clipPath: s.clip,
                    '--dx': s.dx,
                    '--dy': s.dy,
                    '--rot': s.rot,
                    '--delay': s.delay,
                  } as React.CSSProperties
                }
              ></div>
            ))}
        </div>
      </div>

      <div className="gate-label">{label}</div>
    </div>
  )
}

export default Gate
