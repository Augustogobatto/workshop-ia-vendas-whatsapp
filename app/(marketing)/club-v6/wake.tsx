'use client'

import React, { useEffect, useRef, useState } from 'react'
import { IBM_Plex_Mono } from 'next/font/google'

const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'] })

// a sequência do despertar: [pausa antes em ms, texto]
const WAKE: [number, string][] = [
  [2400, 'oi?'],
  [3200, 'tem alguém aí?'],
]

// o momento da escolha — a pessoa decide entrar na conversa
const CHOICES = ['oi, tem sim', 'quem é você?', 'já quero entrar']

const STRIPE_MENSAL = 'https://buy.stripe.com/5kQ00k91qeVL2ve9JG9fW0f'

// efeitos que o Claudinei pode executar na tela (whitelist fechada)
const EFFECTS = new Set(['shake', 'glitch', 'blackout', 'matrix', 'flash'])

const KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a']

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

type Msg = { role: 'claudinei' | 'user'; text: string }

const Wake: React.FC = () => {
  const [messages, setMessages] = useState<Msg[]>([])
  const [typing, setTyping] = useState(false)
  const [inputOn, setInputOn] = useState(false)
  const [choicesOn, setChoicesOn] = useState(false)
  const [wakeDone, setWakeDone] = useState(false)
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)

  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const matrixRef = useRef<HTMLCanvasElement>(null)

  const wokeRef = useRef(false) // usuário interagiu antes do fim do roteiro
  const openingRef = useRef<string | null>(null) // fala de abertura personalizada
  const sessionRef = useRef('')
  const messagesRef = useRef<Msg[]>([])
  const inflightRef = useRef(false)
  const firedRef = useRef(new Set<string>()) // eventos já disparados (1x por sessão)
  const stripeAtRef = useRef(0) // timestamp do último clique em link de checkout
  const draftMaxRef = useRef(0) // maior rascunho digitado sem enviar
  const lastActivityRef = useRef(Date.now())
  const wakeDoneRef = useRef(false)
  const clientRef = useRef<{
    returning: boolean
    visits: number
    lastSeen?: string
    utm?: Record<string, string>
  }>({ returning: false, visits: 1 })

  useEffect(() => {
    messagesRef.current = messages
    lastActivityRef.current = Date.now()
  }, [messages])

  useEffect(() => {
    wakeDoneRef.current = wakeDone
  }, [wakeDone])

  // ═══════════ efeitos de tela (os "poderes" do Claudinei) ═══════════

  const matrixRain = () =>
    new Promise<void>((resolve) => {
      const c = matrixRef.current
      const ctx = c?.getContext('2d')
      if (!c || !ctx) return resolve()
      c.width = window.innerWidth
      c.height = window.innerHeight
      c.style.opacity = '1'
      const colW = 16
      const cols = Math.ceil(c.width / colW)
      const drops = Array.from({ length: cols }, () => Math.random() * -40)
      const chars = 'アイウエオカキクケコサシスセソタチツテト0123456789PUSHCLUB'
      const start = Date.now()
      const tick = () => {
        ctx.fillStyle = 'rgba(5,5,5,0.14)'
        ctx.fillRect(0, 0, c.width, c.height)
        ctx.fillStyle = '#00ff6a'
        ctx.font = '15px monospace'
        for (let i = 0; i < cols; i++) {
          ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * colW, drops[i] * 16)
          drops[i] = drops[i] * 16 > c.height && Math.random() > 0.97 ? 0 : drops[i] + 1
        }
        if (Date.now() - start < 3200) requestAnimationFrame(tick)
        else {
          c.style.opacity = '0'
          setTimeout(() => {
            ctx.clearRect(0, 0, c.width, c.height)
            resolve()
          }, 450)
        }
      }
      tick()
    })

  const runEffect = async (name: string) => {
    if (!EFFECTS.has(name)) return // whitelist: qualquer outra coisa morre aqui
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const root = rootRef.current
    if (!root) return
    if (name === 'matrix') {
      await matrixRain()
      return
    }
    root.classList.add(`fx-${name}`)
    await sleep(name === 'blackout' ? 1000 : 750)
    root.classList.remove(`fx-${name}`)
  }

  // mostra uma resposta: balões separados por linha em branco,
  // tokens [[acao:x]] são removidos do texto e executados no lugar
  const deliverReply = async (reply: string) => {
    const parts = reply.split(/\n\s*\n/).filter(Boolean)
    for (const raw of parts) {
      const actions: string[] = []
      const text = raw
        .replace(/\[\[acao:([a-z_]+)\]\]/gi, (_, a: string) => {
          actions.push(a.toLowerCase())
          return ''
        })
        .trim()
      if (text) {
        setTyping(true)
        await sleep(Math.min(2400, 500 + text.length * 18))
        setTyping(false)
        setMessages((m) => [...m, { role: 'claudinei', text }])
      }
      for (const a of actions) await runEffect(a)
      await sleep(350)
    }
  }

  // ═══════════ sessão persistente + retorno + UTMs + abertura ═══════════

  useEffect(() => {
    try {
      let sid = localStorage.getItem('pc_sid')
      if (!sid) {
        sid = crypto.randomUUID()
        localStorage.setItem('pc_sid', sid)
      }
      sessionRef.current = sid

      const now = Date.now()
      const last = Number(localStorage.getItem('pc_last') || 0)
      const returning = last > 0
      let visits = Number(localStorage.getItem('pc_visits') || 0)
      if (!last || now - last > 30 * 60 * 1000) visits += 1
      localStorage.setItem('pc_visits', String(visits))
      localStorage.setItem('pc_last', String(now))

      let utm: Record<string, string> | undefined
      const fresh: Record<string, string> = {}
      new URLSearchParams(window.location.search).forEach((v, k) => {
        if (k.startsWith('utm_')) fresh[k] = v
      })
      if (Object.keys(fresh).length > 0) {
        localStorage.setItem('pc_utm', JSON.stringify(fresh))
        utm = fresh
      } else {
        const stored = localStorage.getItem('pc_utm')
        if (stored) utm = JSON.parse(stored)
      }

      clientRef.current = {
        returning,
        visits,
        lastSeen: last ? new Date(last).toISOString() : undefined,
        utm,
      }
    } catch {
      sessionRef.current = crypto.randomUUID()
    }

    // pede ao Claudinei a fala de abertura personalizada (paralelo ao roteiro fixo)
    ;(async () => {
      try {
        const res = await fetch('/api/claudinei', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: sessionRef.current,
            client: clientRef.current,
            messages: [{ role: 'user', content: '[EVENTO: abertura]' }],
          }),
        })
        const data = await res.json()
        if (data.reply && !data.demo && !data.limited) openingRef.current = data.reply
      } catch {}
    })()
  }, [])

  // orquestra: roteiro fixo terminou → espera a abertura (máx 6s) → mostra → escolhas
  useEffect(() => {
    if (!wakeDone) return
    let cancelled = false
    ;(async () => {
      const deadline = Date.now() + 6000
      while (!openingRef.current && Date.now() < deadline && !wokeRef.current && !cancelled) {
        await sleep(250)
      }
      if (cancelled || wokeRef.current) return
      if (openingRef.current) await deliverReply(openingRef.current)
      if (!cancelled && !wokeRef.current) setChoicesOn(true)
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wakeDone])

  // ═══════════ o despertar ═══════════

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const later = (fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms)
    timersRef.current.push(t)
    return t
  }

  useEffect(() => {
    let acc = 0
    WAKE.forEach(([pause, text], i) => {
      acc += pause
      later(() => {
        if (wokeRef.current && i > 1) return
        setTyping(true)
      }, acc - 900)
      later(() => {
        if (wokeRef.current && i > 1) return
        setTyping(false)
        setMessages((m) => [...m, { role: 'claudinei', text }])
        if (i === WAKE.length - 1) setWakeDone(true)
      }, acc)
    })
    return () => timersRef.current.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  useEffect(() => {
    if (inputOn) inputRef.current?.focus()
  }, [inputOn])

  // ═══════════ conversa ═══════════

  const send = async (given?: string) => {
    const text = (given ?? value).trim()
    if (!text || inflightRef.current) return
    wokeRef.current = true
    setChoicesOn(false)
    setInputOn(true)
    setValue('')
    draftMaxRef.current = 0
    inflightRef.current = true
    setBusy(true)

    // easter egg: digitar só "push" sacode a tela antes mesmo da resposta
    if (text.toLowerCase() === 'push') runEffect('shake')

    const nextMessages: Msg[] = [...messagesRef.current, { role: 'user', text }]
    setMessages(nextMessages)

    try {
      const res = await fetch('/api/claudinei', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionRef.current,
          client: clientRef.current,
          messages: nextMessages.map((m) => ({
            role: m.role === 'claudinei' ? 'assistant' : 'user',
            content: m.text,
          })),
        }),
      })
      const data = await res.json()
      await deliverReply(data.reply || '...')
    } catch {
      setTyping(false)
      setMessages((m) => [...m, { role: 'claudinei', text: 'caiu minha conexão com o cérebro. manda de novo?' }])
    } finally {
      inflightRef.current = false
      setBusy(false)
      inputRef.current?.focus()
    }
  }

  // evento comportamental → mensagem invisível pro cérebro (1x por sessão cada)
  const sendEvent = async (name: string) => {
    if (firedRef.current.has(name) || inflightRef.current) return
    firedRef.current.add(name)
    inflightRef.current = true
    setBusy(true)
    setInputOn(true)
    setChoicesOn(false)
    try {
      const res = await fetch('/api/claudinei', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionRef.current,
          client: clientRef.current,
          messages: [
            ...messagesRef.current.map((m) => ({
              role: m.role === 'claudinei' ? 'assistant' : 'user',
              content: m.text,
            })),
            { role: 'user', content: `[EVENTO: ${name}]` },
          ],
        }),
      })
      const data = await res.json()
      if (data.reply && !data.limited && !data.demo) await deliverReply(data.reply)
    } catch {
    } finally {
      inflightRef.current = false
      setBusy(false)
    }
  }

  // ═══════════ detectores de eventos + konami ═══════════

  useEffect(() => {
    // konami
    let pos = 0
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      pos = k === KONAMI[pos] ? pos + 1 : k === KONAMI[0] ? 1 : 0
      if (pos === KONAMI.length) {
        pos = 0
        wokeRef.current = true
        runEffect('matrix')
        sendEvent('konami')
      }
    }

    // exit intent (desktop): mouse sai pelo topo
    const onMouseOut = (e: MouseEvent) => {
      if (!wakeDoneRef.current || !wokeRef.current) return
      if (e.relatedTarget === null && e.clientY <= 0) sendEvent('exit_intent')
    }

    // voltou da aba do checkout sem comprar
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return
      if (stripeAtRef.current && Date.now() - stripeAtRef.current > 20_000) {
        stripeAtRef.current = 0
        sendEvent('checkout_abandonado')
      }
    }

    // inatividade: 75s parado depois de fala do Claudinei
    const idleTimer = setInterval(() => {
      if (!wokeRef.current || inflightRef.current || firedRef.current.has('inatividade')) return
      const msgs = messagesRef.current
      if (msgs.length === 0 || msgs[msgs.length - 1].role !== 'claudinei') return
      if (Date.now() - lastActivityRef.current > 75_000) sendEvent('inatividade')
    }, 5000)

    window.addEventListener('keydown', onKey)
    document.addEventListener('mouseout', onMouseOut)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('mouseout', onMouseOut)
      document.removeEventListener('visibilitychange', onVisible)
      clearInterval(idleTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setValue(v)
    lastActivityRef.current = Date.now()
    if (v.length > draftMaxRef.current) draftMaxRef.current = v.length
    // escreveu bastante e apagou tudo sem enviar
    if (v.length === 0 && draftMaxRef.current >= 15 && wokeRef.current) {
      const snapshot = draftMaxRef.current
      setTimeout(() => {
        if (inputRef.current?.value === '' && draftMaxRef.current === snapshot) {
          draftMaxRef.current = 0
          sendEvent('rascunho_apagado')
        }
      }, 1500)
    }
  }

  const trackCheckout = (url: string) => {
    if (url.includes('stripe.com')) stripeAtRef.current = Date.now()
  }

  // transforma URLs em links clicáveis (e marca cliques de checkout)
  const renderText = (text: string) => {
    const parts = text.split(/(https?:\/\/\S+)/g)
    return parts.map((p, i) =>
      /^https?:\/\//.test(p) ? (
        <a key={i} href={p} target="_blank" rel="noopener noreferrer" onClick={() => trackCheckout(p)}>
          {p}
        </a>
      ) : (
        <React.Fragment key={i}>{p}</React.Fragment>
      ),
    )
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .w6 {
          position: fixed; inset: 0;
          background: #050505; color: #d9dde3;
          display: flex; flex-direction: column; align-items: center;
          overflow: hidden;
        }
        .w6-grain { position: fixed; inset: 0; pointer-events: none; z-index: 50; opacity: .12; }

        /* ── poderes do Claudinei ── */
        .w6.fx-shake { animation: fxShake .75s linear; }
        @keyframes fxShake {
          0%, 100% { transform: none; }
          10% { transform: translate(-14px, 8px) rotate(-.4deg); }
          25% { transform: translate(12px, -10px) rotate(.5deg); }
          40% { transform: translate(-10px, 6px); }
          55% { transform: translate(8px, -5px) rotate(-.3deg); }
          70% { transform: translate(-5px, 3px); }
          85% { transform: translate(3px, -2px); }
        }
        .w6.fx-glitch { animation: fxGlitch .7s linear; }
        @keyframes fxGlitch {
          0%, 100% { filter: none; transform: none; }
          12% { filter: hue-rotate(90deg) saturate(4); transform: translateX(-9px) skewX(3deg); }
          24% { filter: invert(1); transform: translateX(7px); }
          36% { filter: none; transform: none; }
          52% { filter: hue-rotate(-120deg) contrast(2); transform: translateX(-5px) skewX(-2deg); }
          64% { filter: invert(1) hue-rotate(180deg); transform: translateX(4px); }
          78% { filter: none; transform: translateX(-2px); }
        }
        .w6.fx-flash { animation: fxFlash .5s linear; }
        @keyframes fxFlash {
          0%, 100% { filter: none; }
          20%, 60% { filter: invert(1); }
          40%, 80% { filter: none; }
        }
        .w6-black {
          position: fixed; inset: 0; background: #000;
          opacity: 0; pointer-events: none; z-index: 95;
          transition: opacity .3s ease;
        }
        .w6.fx-blackout .w6-black { opacity: 1; transition: none; }
        .w6-matrixfx {
          position: fixed; inset: 0; z-index: 90;
          pointer-events: none; opacity: 0;
          transition: opacity .4s ease;
        }

        .w6-scroll {
          flex: 1; width: 100%; max-width: 640px;
          overflow-y: auto; padding: 18vh 1.4rem 2rem;
          scrollbar-width: none;
        }
        .w6-scroll::-webkit-scrollbar { display: none; }

        .w6-msg {
          font-size: .92rem; line-height: 1.7; letter-spacing: .02em;
          margin-bottom: 1.15rem; max-width: 85%;
          animation: w6in .5s ease both;
          white-space: pre-wrap; word-break: break-word;
        }
        @keyframes w6in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }

        .w6-msg.claudinei { color: #d9dde3; }
        .w6-msg.user {
          margin-left: auto; text-align: right;
          color: rgba(217,221,227,.44);
        }
        .w6-msg a { color: #ff5a1f; text-decoration: none; border-bottom: 1px solid rgba(255,90,31,.4); }
        .w6-msg a:hover { border-bottom-color: #ff5a1f; }

        .w6-typing {
          display: flex; gap: 5px; margin-bottom: 1.15rem; padding: .2rem 0;
        }
        .w6-typing i {
          width: 5px; height: 5px; border-radius: 50%;
          background: rgba(217,221,227,.5);
          animation: w6dot 1.2s ease-in-out infinite;
        }
        .w6-typing i:nth-child(2) { animation-delay: .15s; }
        .w6-typing i:nth-child(3) { animation-delay: .3s; }
        @keyframes w6dot { 0%, 60%, 100% { opacity: .25; transform: none; } 30% { opacity: 1; transform: translateY(-3px); } }

        .w6-choices {
          width: 100%; max-width: 640px;
          padding: 0 1.4rem 3.2rem;
          display: flex; gap: .8rem; flex-wrap: wrap;
          animation: w6in .8s ease both;
        }
        .w6-chip {
          background: none; cursor: pointer;
          border: 1px solid rgba(217,221,227,.22); border-radius: 999px;
          color: #d9dde3; font: inherit; font-size: .85rem; letter-spacing: .03em;
          padding: .65rem 1.4rem;
          transition: border-color .25s, color .25s, transform .25s;
        }
        .w6-chip:hover { border-color: #ff5a1f; color: #ff5a1f; transform: translateY(-2px); }

        .w6-inputbar {
          width: 100%; max-width: 640px;
          padding: 0 1.4rem 3.2rem;
          opacity: 0; transform: translateY(8px); pointer-events: none;
          transition: opacity 1.4s ease, transform 1.4s ease;
        }
        .w6-inputbar.on { opacity: 1; transform: none; pointer-events: auto; }

        .w6-input {
          display: flex; align-items: center; gap: .8rem;
          border-bottom: 1px solid rgba(217,221,227,.16);
          padding-bottom: .7rem;
          transition: border-color .3s;
        }
        .w6-input:focus-within { border-bottom-color: rgba(217,221,227,.4); }
        .w6-input span { color: #ff5a1f; font-size: .9rem; }
        .w6-input input {
          flex: 1; background: none; border: 0; outline: 0;
          color: #d9dde3; font: inherit; font-size: .92rem; letter-spacing: .02em;
          caret-color: #ff5a1f;
        }
        .w6-input input::placeholder { color: rgba(217,221,227,.22); }

        /* atalho pra quem já chegou decidido — quase invisível, mas está lá */
        .w6-direct {
          position: fixed; bottom: 1.1rem; right: 1.3rem; z-index: 60;
          font-size: .62rem; letter-spacing: .14em;
          color: rgba(217,221,227,.22); text-decoration: none;
          transition: color .3s;
        }
        .w6-direct:hover { color: #ff5a1f; }

        @media (max-width: 640px) {
          .w6-scroll { padding-top: 12vh; }
          .w6-msg { font-size: .88rem; }
          .w6-direct { bottom: .8rem; right: 1rem; }
        }
        @media (prefers-reduced-motion: reduce) {
          .w6-msg { animation: none; }
          .w6-inputbar { transition: none; }
        }
      ` }} />

      <div className={`w6 ${plexMono.className}`} ref={rootRef}>
        <svg style={{ position: 'absolute', width: 0, height: 0 }}>
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </svg>
        <div className="w6-grain" style={{ filter: 'url(#grain)' }}></div>
        <div className="w6-black"></div>
        <canvas className="w6-matrixfx" ref={matrixRef}></canvas>

        <div className="w6-scroll">
          {messages.map((m, i) => (
            <div key={i} className={`w6-msg ${m.role}`}>
              {renderText(m.text)}
            </div>
          ))}
          {typing && (
            <div className="w6-typing" aria-label="digitando">
              <i></i>
              <i></i>
              <i></i>
            </div>
          )}
          <div ref={endRef}></div>
        </div>

        {choicesOn && (
          <div className="w6-choices">
            {CHOICES.map((c) => (
              <button key={c} className="w6-chip" onClick={() => send(c)}>
                {c}
              </button>
            ))}
          </div>
        )}

        <div className={`w6-inputbar ${inputOn ? 'on' : ''}`}>
          <div className="w6-input">
            <span>&gt;</span>
            <input
              ref={inputRef}
              value={value}
              onChange={onInputChange}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder={busy ? '' : 'diga alguma coisa'}
              disabled={busy}
              maxLength={500}
              aria-label="sua mensagem"
            />
          </div>
        </div>

        <a
          className="w6-direct"
          href={STRIPE_MENSAL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackCheckout(STRIPE_MENSAL)}
        >
          já sei o que quero → entrar
        </a>
      </div>
    </>
  )
}

export default Wake
