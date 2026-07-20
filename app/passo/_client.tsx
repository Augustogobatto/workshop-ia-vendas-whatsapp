'use client'

import React, { useEffect, useRef, useState } from 'react'
import { IBM_Plex_Mono } from 'next/font/google'
import { createClient } from '@/lib/supabase/client'
import { normalizePhoneBR } from '@/lib/utils'

const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'] })

const DESTINO = '/members/passo-relatorio-automatico'
const CARD_DEMO =
  'https://edbhhijnpwgmksxnjzrr.supabase.co/storage/v1/object/public/lesson-assets/card-demo-relatorio.png'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

type Msg = { text: string }
type Stage = 'wake' | 'form' | 'otp'

// modelo de iPhone por (largura, altura, dpr) do viewport CSS
const IPHONES: Record<string, string> = {
  '430x932x3': 'iPhone 15 Pro Max',
  '393x852x3': 'iPhone 15 Pro',
  '428x926x3': 'iPhone 13 Pro Max',
  '390x844x3': 'iPhone 13',
  '375x812x3': 'iPhone 11 Pro',
  '414x896x2': 'iPhone 11',
  '414x896x3': 'iPhone 11 Pro Max',
  '375x667x2': 'iPhone SE',
  '402x874x3': 'iPhone 16 Pro',
  '440x956x3': 'iPhone 16 Pro Max',
}

function detectDevice(): string | null {
  const ua = navigator.userAgent
  if (/iPhone/.test(ua)) {
    const key = `${Math.min(screen.width, screen.height)}x${Math.max(screen.width, screen.height)}x${Math.round(window.devicePixelRatio)}`
    const model = IPHONES[key]
    return model ? `um ${model}` : 'um iPhone'
  }
  if (/iPad/.test(ua)) return 'um iPad'
  if (/Android/.test(ua)) {
    const m = ua.match(/;\s*([A-Za-z0-9\-_ ]+)\s+Build\//)
    return m ? `um ${m[1].trim()}` : 'um Android'
  }
  if (/Macintosh/.test(ua)) return 'um Mac'
  if (/Windows/.test(ua)) return 'um PC com Windows'
  return null
}

function detectSource(): string | null {
  const ua = navigator.userAgent
  if (/Instagram/i.test(ua)) return 'direto do Instagram'
  const ref = document.referrer
  if (/instagram\.com/i.test(ref)) return 'do Instagram'
  if (/whatsapp/i.test(ua) || /whatsapp/i.test(ref)) return 'do WhatsApp'
  const utm = new URLSearchParams(window.location.search).get('utm_source')
  if (utm) return `de ${utm}`
  return null
}

export default function PassoClient({
  city,
  region,
  country,
}: {
  city: string
  region: string
  country: string
}) {
  const [stage, setStage] = useState<Stage>('wake')
  const [messages, setMessages] = useState<Msg[]>([])
  const [typing, setTyping] = useState(false)
  const [choiceOn, setChoiceOn] = useState(false)

  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(0)

  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)
  function supa() {
    if (!supabaseRef.current) supabaseRef.current = createClient()
    return supabaseRef.current
  }
  const codeInputRef = useRef<HTMLInputElement>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const verifyingRef = useRef(false)
  const successRef = useRef(false)
  const startedRef = useRef(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, typing, stage, choiceOn])

  useEffect(() => {
    return () => { if (countdownRef.current) clearInterval(countdownRef.current) }
  }, [])

  async function say(text: string, pre = 600) {
    setTyping(true)
    await sleep(pre + Math.min(1800, text.length * 16))
    setTyping(false)
    setMessages((m) => [...m, { text }])
  }

  // roteiro do "susto bom"
  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    ;(async () => {
      await sleep(900)
      await say('oi.')
      await say('você veio pegar seu passo a passo, né?')

      const partes: string[] = []
      const src = detectSource()
      if (src) partes.push(`veio ${src}`)
      if (city && country === 'BR') partes.push(`tá em ${city}${region ? `/${region}` : ''}`)
      const dev = detectDevice()
      if (dev) partes.push(`usando ${dev}`)
      const hora = new Date()
      partes.push(
        `às ${hora.getHours()}h${String(hora.getMinutes()).padStart(2, '0')}`
      )

      if (partes.length > 1) {
        await say('deixa eu adivinhar…', 900)
        await say(`você ${partes.join(', ')}.`, 1100)
        await say('acertei?', 700)
      } else {
        await say('seu navegador tá tímido, não me contou quase nada de você. respeito.', 900)
      }
      setChoiceOn(true)
    })()
  }, [city, region, country])

  async function handleChoice(resposta: string) {
    setChoiceOn(false)
    setMessages((m) => [...m, { text: `> ${resposta}` }])
    await say('pois é. nenhuma bruxaria — só o que seu navegador entrega pra QUALQUER página.', 500)
    await say('a diferença é que quase ninguém usa isso. igual quase ninguém usa IA de verdade no próprio negócio.', 600)
    await say('o tutorial que você veio buscar é o primeiro passo: um robô que te manda isto aqui todo dia 👇', 600)
    setMessages((m) => [...m, { text: '[card]' }])
    await sleep(900)
    await say('me diz teu nome, whats e email que eu libero teu acesso. grátis.', 800)
    setStage('form')
  }

  function startCountdown() {
    setCountdown(30)
    if (countdownRef.current) clearInterval(countdownRef.current)
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(countdownRef.current!); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const phoneNorm = normalizePhoneBR(phone)
    if (!phoneNorm) {
      setError('Confere o WhatsApp — DDD + número (ex.: 48 99917-4821). Pode incluir o +55.')
      return
    }
    setLoading(true)
    try {
      const { error } = await supa().auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          shouldCreateUser: true,
          data: { name: name.trim(), phone: phoneNorm, origem: 'passo-lp' },
        },
      })
      if (error) throw error
      setStage('otp')
      startCountdown()
      setTimeout(() => codeInputRef.current?.focus(), 100)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Algo deu errado.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp(e?: React.FormEvent, autoCode?: string) {
    e?.preventDefault()
    const token = autoCode ?? code
    if (token.length !== 8) return
    if (verifyingRef.current) return
    verifyingRef.current = true
    setError(null)
    setLoading(true)
    try {
      const { error } = await supa().auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token,
        type: 'email',
      })
      if (error) throw error
      successRef.current = true
      window.location.href = DESTINO
    } catch (err: unknown) {
      if (successRef.current) return
      verifyingRef.current = false
      setLoading(false)
      setError(err instanceof Error ? err.message : 'Código inválido ou expirado.')
      setCode('')
      codeInputRef.current?.focus()
    }
  }

  async function handleResend() {
    setError(null)
    setLoading(true)
    try {
      const { error } = await supa().auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { shouldCreateUser: true },
      })
      if (error) throw error
      setCode('')
      startCountdown()
      codeInputRef.current?.focus()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Algo deu errado.')
    } finally {
      setLoading(false)
    }
  }

  function handleCodeChange(val: string) {
    const digits = val.replace(/\D/g, '').slice(0, 8)
    setCode(digits)
    if (digits.length === 8) {
      setTimeout(() => handleVerifyOtp(undefined, digits), 0)
    }
  }

  return (
    <div
      className={plexMono.className}
      style={{
        minHeight: '100dvh',
        background: '#050505',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '48px 20px 80px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 560 }}>
        {/* header mínimo */}
        <p
          style={{
            fontSize: 11,
            letterSpacing: 3,
            textTransform: 'uppercase',
            color: '#3a3a3a',
            marginBottom: 36,
          }}
        >
          push club · /passo
        </p>

        {/* conversa */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {messages.map((m, i) =>
            m.text === '[card]' ? (
              <img
                key={i}
                src={CARD_DEMO}
                alt="Card do relatório diário no WhatsApp"
                style={{
                  width: '100%',
                  maxWidth: 320,
                  borderRadius: 10,
                  border: '1px solid #222',
                  margin: '6px 0',
                }}
              />
            ) : (
              <p
                key={i}
                className="fade-up"
                style={{
                  fontSize: m.text.startsWith('>') ? 13.5 : 15.5,
                  lineHeight: 1.65,
                  color: m.text.startsWith('>') ? '#666' : '#EDEDED',
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {m.text}
              </p>
            )
          )}
          {typing && (
            <p style={{ color: '#555', fontSize: 15, margin: 0 }} className="pulse">
              •••
            </p>
          )}
        </div>

        {/* escolha */}
        {choiceOn && (
          <div className="fade-up" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 26 }}>
            {['acertou 😳', 'como você sabe disso?'].map((c) => (
              <button
                key={c}
                onClick={() => handleChoice(c)}
                style={{
                  background: 'none',
                  border: '1px solid #333',
                  borderRadius: 8,
                  padding: '10px 16px',
                  color: '#EDEDED',
                  fontSize: 13.5,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {/* formulário */}
        {stage === 'form' && (
          <form
            onSubmit={handleSendOtp}
            className="fade-up"
            style={{
              marginTop: 28,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              background: '#0C0C0C',
              border: '1px solid #1E1E1E',
              borderRadius: 12,
              padding: 22,
            }}
          >
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="seu nome"
              autoComplete="name"
              style={inputStyle}
            />
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="whatsapp — 48 99999-9999"
              autoComplete="tel"
              style={inputStyle}
            />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              autoComplete="email"
              style={inputStyle}
            />
            {error && <ErrorBox message={error} />}
            <button type="submit" disabled={loading} style={btnStyle(loading)}>
              {loading ? '•••' : 'liberar meu acesso →'}
            </button>
            <p style={{ fontSize: 11, color: '#4a4a4a', lineHeight: 1.5, margin: 0 }}>
              você recebe um código de 8 dígitos no email. sem senha, sem cartão.
            </p>
          </form>
        )}

        {/* otp */}
        {stage === 'otp' && (
          <div
            className="fade-up"
            style={{
              marginTop: 28,
              background: '#0C0C0C',
              border: '1px solid #1E1E1E',
              borderRadius: 12,
              padding: 22,
            }}
          >
            <p style={{ fontSize: 13.5, color: '#999', margin: '0 0 14px 0', lineHeight: 1.6 }}>
              mandei um código de 8 dígitos pra{' '}
              <strong style={{ color: '#EDEDED' }}>{email}</strong>. digita aqui que o
              tutorial abre na hora.
            </p>
            <form onSubmit={(e) => handleVerifyOtp(e)} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                ref={codeInputRef}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                placeholder="00000000"
                style={{
                  ...inputStyle,
                  fontSize: 22,
                  letterSpacing: 8,
                  textAlign: 'center',
                }}
              />
              {error && <ErrorBox message={error} />}
              <button type="submit" disabled={loading || code.length !== 8} style={btnStyle(loading || code.length !== 8)}>
                {loading ? '•••' : 'abrir o tutorial →'}
              </button>
            </form>
            <button
              onClick={handleResend}
              disabled={countdown > 0 || loading}
              style={{
                background: 'none',
                border: 'none',
                color: '#555',
                fontSize: 12,
                marginTop: 14,
                cursor: countdown > 0 ? 'default' : 'pointer',
                fontFamily: 'inherit',
                padding: 0,
              }}
            >
              {countdown > 0 ? `reenviar em ${countdown}s` : 'reenviar código'}
            </button>
          </div>
        )}

        <div ref={endRef} />
      </div>
    </div>
  )
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div
      style={{
        fontSize: 12,
        color: '#FF6B61',
        padding: '8px 10px',
        background: 'rgba(255, 69, 58, 0.08)',
        borderRadius: 6,
        border: '1px solid rgba(255, 69, 58, 0.2)',
      }}
    >
      {message}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 13px',
  background: '#111',
  border: '1px solid #262626',
  borderRadius: 8,
  fontSize: 14,
  color: '#EDEDED',
  outline: 'none',
  fontFamily: 'inherit',
}

function btnStyle(disabled: boolean): React.CSSProperties {
  return {
    padding: '12px 20px',
    background: disabled ? '#1E1E1E' : '#EDEDED',
    color: disabled ? '#555' : '#0A0A0A',
    border: 'none',
    borderRadius: 8,
    fontWeight: 500,
    fontSize: 14,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'inherit',
  }
}
