'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Stage = 'form' | 'otp'
type Mode = 'signup' | 'login'

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const searchParams = useSearchParams()
  const [stage, setStage] = useState<Stage>('form')
  const [mode, setMode] = useState<Mode>(searchParams.get('novo') === '1' ? 'signup' : 'login')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(0)

  const router = useRouter()
  const supabase = createClient()
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
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: mode === 'signup',
          ...(mode === 'signup' && { data: { name, phone } }),
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
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      })
      if (error) throw error
      successRef.current = true
      window.location.href = '/members'
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
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: mode === 'signup' },
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

  function switchMode() {
    setMode((m) => (m === 'signup' ? 'login' : 'signup'))
    setError(null)
  }

  function backToForm() {
    setStage('form')
    setCode('')
    setError(null)
    if (countdownRef.current) clearInterval(countdownRef.current)
    setCountdown(0)
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      {/* Brand */}
      <div className="fade-up" style={{ marginBottom: 40, textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 6 }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: '#FFFFFF',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            🦾
          </div>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 18,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: 'var(--text)',
            }}
          >
            IA Revolution
          </span>
        </div>
      </div>

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
          <h1 style={headingStyle}>
            {mode === 'signup' ? 'Criar acesso' : 'Entrar'}
          </h1>
          <p style={subtitleStyle}>
            {mode === 'signup'
              ? 'Preencha seus dados para receber o código de acesso.'
              : 'Informe seu email para receber o código de acesso.'}
          </p>

          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'signup' && (
              <>
                <div>
                  <label style={labelStyle}>Nome completo</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Augusto Gobatto"
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
              </>
            )}

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
              {loading
                ? <span className="pulse">•••</span>
                : <>{mode === 'signup' ? 'Criar acesso' : 'Enviar código'}&nbsp;→</>
              }
            </button>
          </form>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
            <button onClick={switchMode} style={ghostBtnStyle}>
              {mode === 'signup'
                ? <>Já tenho conta —{' '}<span style={{ color: 'var(--text)', textDecoration: 'underline', textUnderlineOffset: 3 }}>entrar</span></>
                : <>Ainda não tenho conta —{' '}<span style={{ color: 'var(--text)', textDecoration: 'underline', textUnderlineOffset: 3 }}>criar acesso</span></>
              }
            </button>
          </div>
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
          {/* Icon */}
          <div
            style={{
              width: 44,
              height: 44,
              background: 'var(--green-10)',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
              border: '1px solid var(--green-20)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 6A1.5 1.5 0 0 1 4.5 4.5h11A1.5 1.5 0 0 1 17 6v8a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 14V6Z" stroke="var(--green)" strokeWidth="1.4" />
              <path d="m3 6.5 7 5 7-5" stroke="var(--green)" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </div>

          <h2 style={headingStyle}>Código enviado</h2>
          <p style={{ ...subtitleStyle, marginBottom: 24 }}>
            Enviamos um código de 8 dígitos para{' '}
            <strong style={{ color: 'var(--text)' }}>{email}</strong>.
            <br />Digite abaixo para entrar.
          </p>

          <form onSubmit={(e) => handleVerifyOtp(e)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={labelStyle}>Código de acesso</label>
              <input
                ref={codeInputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={8}
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                placeholder="00000000"
                autoComplete="one-time-code"
                style={{
                  ...inputStyle,
                  fontSize: 26,
                  letterSpacing: '0.35em',
                  textAlign: 'center',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  paddingLeft: '0.35em',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--green-20)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>

            {error && <ErrorBox message={error} />}

            <button
              type="submit"
              disabled={loading || code.length !== 8}
              style={primaryBtnStyle(loading || code.length !== 8)}
              onMouseEnter={(e) => {
                if (!loading && code.length === 8) e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none' }}
            >
              {loading ? <span className="pulse">•••</span> : 'Confirmar →'}
            </button>
          </form>

          <div
            style={{
              marginTop: 20,
              paddingTop: 16,
              borderTop: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              alignItems: 'center',
            }}
          >
            {countdown > 0 ? (
              <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>Reenviar em {countdown}s</p>
            ) : (
              <button onClick={handleResend} disabled={loading} style={ghostBtnStyle}>
                Reenviar código
              </button>
            )}
            <button onClick={backToForm} style={{ ...ghostBtnStyle, color: 'var(--text-dim)' }}>
              Usar outro email
            </button>
          </div>
        </div>
      )}

      <p
        className="fade-up fade-up-2"
        style={{ marginTop: 24, fontSize: 11, color: 'var(--text-dim)', textAlign: 'center' }}
      >
        Não compartilhamos seus dados com terceiros.
      </p>
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
  cursor: 'pointer',
  fontSize: 12.5,
  color: 'var(--text-muted)',
  fontFamily: 'var(--font-ui)',
}
