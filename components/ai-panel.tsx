'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const WEBHOOK =
  process.env.NEXT_PUBLIC_CLAUDINEI_WEBHOOK ||
  'https://n8n-n8n.0pqeuc.easypanel.host/webhook/fa9a93ee-e4a9-4518-9081-7cdf5cbb407e'

const MIN_W = 280
const MAX_W = 600
const DEFAULT_W = 380

interface Msg {
  id: string
  role: 'user' | 'bot'
  text: string
}

function renderText(raw: string): string {
  const escaped = raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}

function buildContext(
  pathname: string,
  userName?: string | null,
  ownedProducts?: { slug: string; name: string }[],
) {
  const parts = pathname.replace(/^\/members\/?/, '').split('/').filter(Boolean)

  const checklist = (() => {
    try {
      const raw = sessionStorage.getItem('checklist_pre_aula_ia_vendas')
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  })()

  const base = {
    ...(userName ? { userName } : {}),
    ...(ownedProducts?.length ? { ownedProducts } : {}),
    ...(checklist ? { checklist } : {}),
  }

  if (parts.length === 0) return { page: 'dashboard', ...base }
  if (parts.length === 1) return { page: 'workshop', productSlug: parts[0], ...base }
  if (parts.length === 3) return { page: 'lesson', productSlug: parts[0], moduleSlug: parts[1], lessonSlug: parts[2], ...base }
  return { page: 'workshop', productSlug: parts[0], moduleSlug: parts[1], ...base }
}

function greetingFor(pathname: string, userName?: string | null): string {
  const first = userName?.split(' ')[0]
  const fala = first ? `Fala, ${first}.` : 'Fala!'
  return `${fala} Já fechou quantas missões?`
}

/* ── Avatar do bot ────────────────────────────────── */
function BotAvatar({ size = 28 }: { size?: number }) {
  return (
    <img
      src="/claudinei.png"
      alt="Claudinei"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        flexShrink: 0,
        objectFit: 'cover',
        boxShadow: '0 0 0 1px rgba(0,255,136,0.2)',
      }}
    />
  )
}

interface AIPanelProps {
  open: boolean
  onToggle: () => void
  width: number
  onWidthChange: (w: number) => void
  userName?: string | null
  ownedProducts?: { slug: string; name: string }[]
  isMobile?: boolean
}

export function AIPanel({ open, onToggle, width, onWidthChange, userName, ownedProducts = [], isMobile = false }: AIPanelProps) {
  const pathname = usePathname()
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [typing, setTyping] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)

  const bottomRef    = useRef<HTMLDivElement>(null)
  const textareaRef  = useRef<HTMLTextAreaElement>(null)
  const sessionId    = useRef('')
  const greeted      = useRef(false)
  const drag         = useRef({ active: false, startX: 0, startW: 0 })
  const widthRef     = useRef(width)
  const supabase     = createClient()

  useEffect(() => { widthRef.current = width }, [width])

  // Restore or create session ID, then load history
  useEffect(() => {
    const stored = localStorage.getItem('ai_sid')
    const sid = stored ?? 'm_' + Math.random().toString(36).slice(2, 10)
    if (!stored) localStorage.setItem('ai_sid', sid)
    sessionId.current = sid

    supabase
      .from('vendas_ai_mensagens')
      .select('id, message')
      .eq('session_id', sid)
      .order('id', { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          const history: Msg[] = data
            .filter(row => row.message?.type === 'human' || row.message?.type === 'ai')
            .map(row => ({
              id: String(row.id),
              role: row.message.type === 'human' ? 'user' : 'bot',
              text: row.message.content ?? '',
            }))
          setMessages(history)
          greeted.current = true // não mostra greeting se já tem histórico
        }
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (open && !greeted.current) {
      greeted.current = true
      addMsg('bot', greetingFor(pathname, userName))
    }
  }, [open, pathname, userName])

  useEffect(() => {
    if (open) {
      setTimeout(() => textareaRef.current?.focus(), 120)
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'instant' }), 60)
    }
  }, [open])

  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 40)
  }, [messages, typing])

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }, [input])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!drag.current.active) return
      const delta = drag.current.startX - e.clientX
      const next = Math.min(MAX_W, Math.max(MIN_W, drag.current.startW + delta))
      widthRef.current = next
      onWidthChange(next)
    }
    const onUp = () => {
      if (!drag.current.active) return
      drag.current.active = false
      localStorage.setItem('ai_panel_w', String(widthRef.current))
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [onWidthChange])

  function addMsg(role: 'user' | 'bot', text: string) {
    setMessages(prev => [...prev, { id: crypto.randomUUID(), role, text }])
  }

  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || busy) return
    setInput('')
    addMsg('user', text)
    setBusy(true)
    setTyping(true)

    try {
      const res = await fetch(WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          sessionId: sessionId.current,
          source: 'landing_page',
          context: buildContext(pathname, userName, ownedProducts),
          timestamp: new Date().toISOString(),
        }),
      })
      setTyping(false)
      if (!res.ok) throw new Error('http ' + res.status)
      const data = await res.json()
      const reply = data.response ?? data.text ?? data.message ?? data.output
        ?? 'Desculpa, não consegui processar agora. Tenta de novo!'
      addMsg('bot', reply)
    } catch {
      setTyping(false)
      addMsg('bot', 'Erro de conexão. Tenta de novo em instantes.')
    } finally {
      setBusy(false)
      textareaRef.current?.focus()
    }
  }, [input, busy, pathname])

  if (!open) return null

  const canSend = !!input.trim() && !busy

  return (
    <div
      className={isMobile ? 'ai-panel-mobile' : undefined}
      style={isMobile ? {
        position: 'fixed', bottom: 0, left: 0, right: 0,
        height: '82dvh',
        zIndex: 35, display: 'flex', flexDirection: 'column',
        background: 'var(--bg-2)',
        borderTop: '1px solid var(--border)',
        borderRadius: '16px 16px 0 0',
      } : {
        position: 'fixed', top: 0, right: 0, bottom: 0, width,
        zIndex: 30, display: 'flex', flexDirection: 'column',
        background: 'var(--bg-2)',
        borderLeft: '1px solid var(--border)',
      }}
    >

      {/* ── Pull indicator — mobile only ─────────────── */}
      {isMobile && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 2px', flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border-2)' }} />
        </div>
      )}

      {/* ── Drag handle — desktop only ───────────────── */}
      {!isMobile && (
        <div
          onMouseDown={e => { drag.current = { active: true, startX: e.clientX, startW: widthRef.current } }}
          style={{
            position: 'absolute', left: -4, top: 0, bottom: 0, width: 8,
            cursor: 'col-resize', zIndex: 10,
          }}
        />
      )}

      {/* ── Header ───────────────────────────────────── */}
      <div style={{
        padding: '14px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 10,
        flexShrink: 0,
        background: 'var(--bg)',
      }}>
        <BotAvatar size={32} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 14, fontWeight: 700,
            fontFamily: 'var(--font-display)',
            color: 'var(--text)', lineHeight: 1.2,
            letterSpacing: '0.01em',
          }}>
            Claudinei
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
            <div className="pulse" style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--green)',
              boxShadow: '0 0 5px var(--green)',
              flexShrink: 0,
            }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.02em' }}>
              Assistente IA
            </span>
          </div>
        </div>

        <button
          onClick={onToggle}
          title="Fechar painel"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-dim)', padding: 6,
            borderRadius: 'var(--radius-sm)',
            display: 'flex', lineHeight: 0,
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M11.782 4.032a.5.5 0 1 0-.707-.707L7.5 6.793 4.925 4.218a.5.5 0 0 0-.707.707L6.793 7.5l-2.575 2.575a.5.5 0 1 0 .707.707L7.5 8.207l2.575 2.575a.5.5 0 1 0 .707-.707L8.207 7.5l2.575-2.575z" fill="currentColor"/>
          </svg>
        </button>
      </div>

      {/* ── Mensagens ────────────────────────────────── */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '20px 16px',
        display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        {messages.map((msg, i) => {
          const prev = messages[i - 1]
          const isGrouped = prev?.role === msg.role
          return (
            <div key={msg.id} style={{
              display: 'flex',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              alignItems: 'flex-end',
              gap: 8,
              marginTop: isGrouped ? -8 : 0,
            }}>
              {/* Avatar do bot — só na primeira de um grupo */}
              {msg.role === 'bot' && (
                <div style={{ flexShrink: 0, marginBottom: 2 }}>
                  {!isGrouped ? <BotAvatar size={26} /> : <div style={{ width: 26 }} />}
                </div>
              )}

              <div
                dangerouslySetInnerHTML={{ __html: renderText(msg.text) }}
                style={{
                  maxWidth: '82%',
                  padding: '10px 13px',
                  borderRadius: msg.role === 'user'
                    ? (isGrouped ? '14px 4px 4px 14px' : '14px 14px 4px 14px')
                    : (isGrouped ? '4px 14px 14px 4px' : '4px 14px 14px 14px'),
                  background: msg.role === 'user' ? 'var(--green-20)' : 'var(--surface)',
                  border: `1px solid ${msg.role === 'user' ? 'rgba(0,255,136,0.15)' : 'var(--border)'}`,
                  fontSize: 13.5,
                  lineHeight: 1.6,
                  color: 'var(--text)',
                  wordBreak: 'break-word',
                }}
              />
            </div>
          )
        })}

        {/* ── Typing indicator ─────────────────────── */}
        {typing && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <BotAvatar size={26} />
            <div style={{
              padding: '11px 15px',
              borderRadius: '4px 14px 14px 14px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              display: 'flex', gap: 5, alignItems: 'center',
            }}>
              {[0, 0.18, 0.36].map((delay, i) => (
                <span key={i} style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: 'var(--text-muted)',
                  display: 'inline-block',
                  animation: `pulse 1.1s ease-in-out ${delay}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input ────────────────────────────────────── */}
      <div style={{
        padding: '12px 16px 16px',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg)',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: 0,
          background: 'var(--surface)',
          border: `1px solid ${inputFocused ? 'rgba(0,255,136,0.35)' : 'var(--border-2)'}`,
          borderRadius: 10,
          padding: '8px 8px 8px 13px',
          transition: 'border-color 0.15s',
          boxShadow: inputFocused ? '0 0 0 3px rgba(0,255,136,0.06)' : 'none',
        }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder="Manda sua dúvida…"
            rows={1}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: 'var(--text)', fontSize: 13.5,
              padding: '2px 0', resize: 'none',
              fontFamily: 'var(--font-ui)', lineHeight: 1.55,
              overflowY: 'auto', minHeight: 22, maxHeight: 120,
            }}
          />
          <button
            onClick={send}
            disabled={!canSend}
            title="Enviar (Enter)"
            style={{
              flexShrink: 0, alignSelf: 'flex-end',
              width: 30, height: 30,
              borderRadius: 7,
              background: canSend ? 'var(--green)' : 'transparent',
              border: `1px solid ${canSend ? 'transparent' : 'var(--border-2)'}`,
              cursor: canSend ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s, border-color 0.15s',
              marginLeft: 6,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z"
                stroke={canSend ? '#0A0C0A' : 'var(--text-dim)'}
                strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        {!isMobile && (
          <div style={{
            marginTop: 7, fontSize: 11,
            color: 'var(--text-dim)', textAlign: 'center',
            letterSpacing: '0.01em',
          }}>
            Enter para enviar · Shift+Enter para nova linha
          </div>
        )}
      </div>
    </div>
  )
}
