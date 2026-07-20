'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Stage = 'form' | 'otp'

const DESTINO = '/members/passo-relatorio-automatico'
const CARD_DEMO =
  'https://edbhhijnpwgmksxnjzrr.supabase.co/storage/v1/object/public/lesson-assets/card-demo-relatorio.png'

export default function PassoPage() {
  const [stage, setStage] = useState<Stage>('form')
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

  useEffect(() => {
    return () => { if (countdownRef.current) clearInterval(countdownRef.current) }
  }, [])

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
    setLoading(true)
    try {
      const { error } = await supa().auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          data: { name, phone },
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
      const { error } = await supa().auth.verifyOtp({ email, token, type: 'email' })
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
        email,
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
      style={{
        minHeight: '100dvh',
        background: 'var(--bg)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 48,
        padding: '48px 20px',
      }}
    >
      {/* Pitch */}
      <div className="fade-up" style={{ width: '100%', maxWidth: 460 }}>
        <p
          style={{
            fontSize: 12,
            letterSpacing: 2,
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            marginBottom: 12,
          }}
        >
          Acesso gratuito · do reel
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 5vw, 38px)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            color: 'var(--text)',
            marginBottom: 14,
          }}
        >
          O Passo a Passo do Relatório Automático
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-muted)', marginBottom: 20 }}>
          Todo dia de manhã, isto aqui chega sozinho no seu WhatsApp: gasto em anúncio,
          vendas, custo por venda e ROAS — sem abrir dashboard, sem planilha. O tutorial
          completo de como eu montei, com o prompt pronto pra você colar na sua IA.
        </p>
        <img
          src={CARD_DEMO}
          alt="Card do relatório diário no WhatsApp"
          style={{
            width: '100%',
            maxWidth: 340,
            borderRadius: 10,
            border: '1px solid var(--border-2)',
            display: 'block',
          }}
        />
      </div>

      {/* Form */}
      {stage === 'form' ? (
        <div
          className="fade-up fade-up-1"
          style={{
            width: '100%',
            maxWidth: 380,
            background: 'var(--bg-2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px 28px 24px',
          }}
        >
          <h2 style={headingStyle}>Liberar meu acesso</h2>
          <p style={subtitleStyle}>
            Grátis. Você recebe um código de 8 dígitos no e-mail — sem senha, sem cartão.
          </p>

          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={labelStyle}>Nome</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'var(--border-2)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
            <div>
              <label style={labelStyle}>WhatsApp</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+55 48 99999-9999"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'var(--border-2)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'var(--border-2)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>

            {error && <ErrorBox message={error} />}

            <button
              type="submit"
              disabled={loading}
              style={primaryBtnStyle(loading)}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none' }}
            >
              {loading ? <span className="pulse">•••</span> : <>Quero o passo a passo&nbsp;→</>}
            </button>
          </form>

          <p style={{ marginTop: 16, fontSize: 11.5, color: 'var(--text-dim)', lineHeight: 1.5 }}>
            Ao criar o acesso você entra na plataforma do Push Club com o tutorial liberado.
            Os demais cursos ficam visíveis e podem ser destravados na assinatura.
          </p>
        </div>
      ) : (
        <div
          className="fade-up fade-up-1"
          style={{
            width: '100%',
            maxWidth: 380,
            background: 'var(--bg-2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '32px 28px 28px',
          }}
        >
          <h2 style={headingStyle}>Código enviado</h2>
          <p style={{ ...subtitleStyle, marginBottom: 24 }}>
            Enviamos um código de 8 dígitos para{' '}
            <strong style={{ color: 'var(--text)' }}>{email}</strong>. Digite abaixo — o
            tutorial abre na sequência.
          </p>

          <form onSubmit={(e) => handleVerifyOtp(e)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
                fontFamily: 'ui-monospace, monospace',
              }}
            />

            {error && <ErrorBox message={error} />}

            <button
              type="submit"
              disabled={loading || code.length !== 8}
              style={primaryBtnStyle(loading || code.length !== 8)}
            >
              {loading ? <span className="pulse">•••</span> : <>Abrir o tutorial&nbsp;→</>}
            </button>
          </form>

          <div style={{ marginTop: 18, textAlign: 'center' }}>
            <button
              onClick={handleResend}
              disabled={countdown > 0 || loading}
              style={{ ...ghostBtnStyle, cursor: countdown > 0 ? 'default' : 'pointer' }}
            >
              {countdown > 0 ? `Reenviar código em ${countdown}s` : 'Reenviar código'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div
      style={{
        fontSize: 12,
        color: 'var(--red)',
        padding: '8px 10px',
        background: 'rgba(255, 69, 58, 0.08)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid rgba(255, 69, 58, 0.2)',
      }}
    >
      {message}
    </div>
  )
}

const headingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 22,
  fontWeight: 700,
  letterSpacing: '-0.01em',
  marginBottom: 4,
  color: 'var(--text)',
}

const subtitleStyle: React.CSSProperties = {
  fontSize: 13,
  color: 'var(--text-muted)',
  marginBottom: 24,
  lineHeight: 1.5,
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 500,
  color: 'var(--text-muted)',
  marginBottom: 6,
  letterSpacing: '0.03em',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  background: 'var(--bg-3)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  fontSize: 13.5,
  color: 'var(--text)',
  outline: 'none',
  transition: 'border-color 0.15s',
  fontFamily: 'var(--font-ui)',
}

function primaryBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    marginTop: 4,
    padding: '11px 20px',
    background: disabled ? 'var(--border-2)' : 'var(--green)',
    color: disabled ? 'var(--text-muted)' : '#0A0A0A',
    border: 'none',
    borderRadius: 'var(--radius)',
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 14,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background 0.15s, transform 0.1s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  }
}

const ghostBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  fontSize: 12.5,
  color: 'var(--text-muted)',
  fontFamily: 'var(--font-ui)',
}
