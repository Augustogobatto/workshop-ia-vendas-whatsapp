'use client'

import { useEffect, useState, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'

const WORKSHOP_DATE = new Date('2026-04-21T08:00:00-03:00')
const MEET_URL = 'https://meet.google.com/zux-fxun-qbt'
const CHECKLIST_ID = 'pre_aula_ia_vendas'

const CHECKLIST = [
  { key: 'bm_whatsapp',       text: 'BM verificada com WhatsApp liberado (se não for API oficial: Evolution ou Z-API)', required: true },
  { key: 'numero_dedicado',   text: 'Número de WhatsApp dedicado, separado do pessoal', required: true },
  { key: 'vps',               text: 'VPS na Hostinger (ou outro provedor que rode n8n, Chatwoot e Redis)', required: true },
  { key: 'conta_supabase',    text: 'Conta no Supabase (gratuita)', required: true },
  { key: 'conta_openrouter',  text: 'Conta na OpenRouter', required: true },
  { key: 'assinatura_claude', text: 'Assinatura do Claude', required: false },
]

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function getTimeLeft() {
  const diff = WORKSHOP_DATE.getTime() - Date.now()
  if (diff <= 0) return null
  return {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  }
}

function saveChecklistToSession(checked: Record<string, boolean>) {
  sessionStorage.setItem('checklist_' + CHECKLIST_ID, JSON.stringify(checked))
}

export function WorkshopBanner() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft)

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000)
    return () => clearInterval(id)
  }, [])

  const isLive = timeLeft === null

  return (
    <div
      style={{
        background: 'var(--green-subtle)',
        border: '1px solid var(--green-20)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px 24px 20px',
        marginBottom: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span
          className="pulse"
          style={{ width: 7, height: 7, background: 'var(--green)', borderRadius: '50%', display: 'inline-block', flexShrink: 0 }}
        />
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--green)' }}>
          {isLive ? 'Acontecendo agora' : 'Workshop ao vivo'}
        </span>
      </div>

      <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
        IA de Vendas no WhatsApp
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
        Terça-feira, 21 de abril · 08h00 (horário de Brasília)
      </div>

      {!isLive && timeLeft && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          {[
            { value: timeLeft.days,    label: 'dias' },
            { value: timeLeft.hours,   label: 'horas' },
            { value: timeLeft.minutes, label: 'min' },
            { value: timeLeft.seconds, label: 'seg' },
          ].map(({ value, label }) => (
            <div
              key={label}
              style={{
                background: 'var(--bg-3)',
                border: '1px solid var(--border-2)',
                borderRadius: 'var(--radius)',
                padding: '10px 14px',
                textAlign: 'center',
                minWidth: 58,
              }}
            >
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>
                {pad(value)}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, letterSpacing: '0.06em' }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      )}

      <a
        href={MEET_URL}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 20px',
          background: 'var(--green)',
          color: '#0A0A0A',
          borderRadius: 'var(--radius)',
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: '0.03em',
          textDecoration: 'none',
        }}
      >
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h8A1.5 1.5 0 0 1 13 3.5v5A1.5 1.5 0 0 1 11.5 10h-3l-3 3v-3H3.5A1.5 1.5 0 0 1 2 8.5v-5Z" stroke="currentColor" strokeWidth="1.3"/>
        </svg>
        {isLive ? 'Entrar no Meet agora' : 'Acessar o Google Meet'}
      </a>
    </div>
  )
}

export function WorkshopChecklist() {
  const [open, setOpen] = useState(false)
  const [checked, setChecked] = useState<Record<string, boolean>>(
    () => Object.fromEntries(CHECKLIST.map(item => [item.key, false]))
  )
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Carrega progresso do banco na montagem
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from('checklist_progress')
        .select('item_key, checked')
        .eq('auth_user_id', user.id)
        .eq('checklist_id', CHECKLIST_ID)

      if (data && data.length > 0) {
        const state = Object.fromEntries(CHECKLIST.map(item => [item.key, false]))
        data.forEach(row => { state[row.item_key] = row.checked })
        setChecked(state)
        saveChecklistToSession(state)
      }
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggle = useCallback(async (key: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const next = !checked[key]
    const nextState = { ...checked, [key]: next }
    setChecked(nextState)
    saveChecklistToSession(nextState)

    await supabase
      .from('checklist_progress')
      .upsert({
        auth_user_id: user.id,
        checklist_id: CHECKLIST_ID,
        item_key: key,
        checked: next,
        checked_at: next ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'auth_user_id,checklist_id,item_key' })
  }, [checked, supabase])

  const done = Object.values(checked).filter(Boolean).length

  return (
    <div
      id="checklist"
      style={{
        background: 'var(--bg-2)',
        border: '1px solid var(--border-2)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        marginBottom: 36,
        opacity: loading ? 0.6 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      {/* Header */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          padding: '18px 24px 16px',
          borderBottom: open ? '1px solid var(--border)' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 16 }}>⚠️</span>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: '0.02em',
                color: 'var(--text)',
                textTransform: 'uppercase',
              }}
            >
              Missões pré-aula
            </span>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
            Execute isso antes da aula — sua vida vai ser muito mais fácil.{' '}
            <span style={{ color: 'var(--text-dim)' }}>
              (Caso precise de ajuda, chame o Claudinei aqui do lado — ele foi treinado pra te ajudar com cada etapa.)
            </span>
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div
            style={{
              padding: '4px 10px',
              background: done === CHECKLIST.length ? 'var(--green-10)' : 'var(--surface)',
              border: `1px solid ${done === CHECKLIST.length ? 'var(--green-20)' : 'var(--border-2)'}`,
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              color: done === CHECKLIST.length ? 'var(--green)' : 'var(--text-muted)',
              transition: 'all 0.2s',
            }}
          >
            {done}/{CHECKLIST.length}
          </div>
          <svg
            width="14" height="14" viewBox="0 0 14 14" fill="none"
            style={{
              color: 'var(--text-dim)',
              transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform 0.2s',
              flexShrink: 0,
            }}
          >
            <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Items */}
      {open && (
      <div style={{ padding: '16px 24px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {CHECKLIST.map((item) => (
          <div
            key={item.key}
            onClick={() => !loading && toggle(item.key)}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              cursor: loading ? 'default' : 'pointer',
              padding: '10px 14px',
              borderRadius: 'var(--radius)',
              background: checked[item.key] ? 'var(--green-subtle)' : 'var(--surface)',
              border: `1px solid ${checked[item.key] ? 'var(--green-20)' : 'var(--border)'}`,
              transition: 'background 0.15s, border-color 0.15s',
            }}
          >
            <div
              style={{
                width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1,
                border: checked[item.key] ? 'none' : '1.5px solid var(--border-2)',
                background: checked[item.key] ? 'var(--green)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s',
              }}
            >
              {checked[item.key] && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2.5 2.5L8 3" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <span
                style={{
                  fontSize: 13.5,
                  color: checked[item.key] ? 'var(--text-muted)' : 'var(--text)',
                  textDecoration: checked[item.key] ? 'line-through' : 'none',
                  transition: 'color 0.15s',
                  lineHeight: 1.45,
                }}
              >
                {item.text}
              </span>
              {!item.required && (
                <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>
                  Útil mas não obrigatório
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  )
}
