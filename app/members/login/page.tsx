'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Stage = 'form' | 'sent'

export default function LoginPage() {
  const [stage, setStage] = useState<Stage>('form')
  const [mode, setMode] = useState<'signup' | 'login'>('signup')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (mode === 'signup') {
        // Use OTP (magic link) for signup too — Supabase creates the user automatically
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            data: { name, phone },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            shouldCreateUser: true,
          },
        })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/members` },
        })
        if (error) throw error
      }
      setStage('sent')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Algo deu errado. Tenta de novo.'
      setError(msg)
    } finally {
      setLoading(false)
    }
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
      {/* Brand mark */}
      <div className="fade-up" style={{ marginBottom: 40, textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 6 }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: 'var(--green)',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L13 10.5H1L7 1Z" fill="#0A0A0A"/>
            </svg>
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
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '-0.01em',
              marginBottom: 4,
              color: 'var(--text)',
            }}
          >
            {mode === 'signup' ? 'Acesse sua área' : 'Entrar'}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.5 }}>
            {mode === 'signup'
              ? 'Preencha seus dados para criar o acesso.'
              : 'Informe seu email e enviaremos um link de acesso.'}
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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

            {error && (
              <div style={{ fontSize: 12, color: 'var(--red)', padding: '8px 10px', background: 'rgba(255, 69, 58, 0.1)', borderRadius: 'var(--radius-sm)' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 4,
                padding: '11px 20px',
                background: loading ? 'var(--border-2)' : 'var(--green)',
                color: loading ? 'var(--text-muted)' : '#0A0A0A',
                border: 'none',
                borderRadius: 'var(--radius)',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s, transform 0.1s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none' }}
            >
              {loading ? (
                <>
                  <span className="pulse">•••</span>
                </>
              ) : (
                <>
                  {mode === 'signup' ? 'Criar acesso' : 'Enviar link'}&nbsp;→
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
            <button
              onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError(null) }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 12.5,
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-ui)',
              }}
            >
              {mode === 'signup'
                ? <>Já tenho conta — <span style={{ color: 'var(--text)', textDecoration: 'underline', textUnderlineOffset: 3 }}>entrar</span></>
                : <>Ainda não tenho conta — <span style={{ color: 'var(--text)', textDecoration: 'underline', textUnderlineOffset: 3 }}>criar acesso</span></>
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
            padding: '36px 28px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              background: 'var(--green-10)',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              border: '1px solid var(--green-20)',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h13A1.5 1.5 0 0 1 19 6.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 3 15.5v-9Z" stroke="var(--green)" strokeWidth="1.4"/>
              <path d="m3 7 8 5.5L19 7" stroke="var(--green)" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 20,
              fontWeight: 700,
              marginBottom: 8,
              color: 'var(--text)',
            }}
          >
            Verifique seu email
          </h2>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
            Enviamos um link de acesso para<br />
            <strong style={{ color: 'var(--text)' }}>{email}</strong>
            <br /><br />
            Abra o email e clique no link para entrar.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={() => { setStage('form'); setError(null) }}
              style={{
                padding: '9px 16px',
                background: 'var(--surface)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                fontSize: 12.5,
                cursor: 'pointer',
                fontFamily: 'var(--font-ui)',
              }}
            >
              Usar outro email
            </button>
          </div>
        </div>
      )}

      <p className="fade-up fade-up-2" style={{ marginTop: 24, fontSize: 11, color: 'var(--text-dim)', textAlign: 'center' }}>
        Não compartilhamos seus dados com terceiros.
      </p>
    </div>
  )
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
