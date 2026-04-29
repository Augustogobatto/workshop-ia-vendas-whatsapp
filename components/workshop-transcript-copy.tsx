'use client'

import { useState } from 'react'

export function WorkshopTranscriptCopy() {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const res = await fetch('/downloads/transcricao-workshop.txt')
    const text = await res.text()
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div
      style={{
        background: 'var(--bg-2)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        marginTop: 16,
      }}
    >
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          padding: '16px 20px',
          borderBottom: open ? '1px solid var(--border)' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: '0.03em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}>
          Transcrição da Aula
        </span>
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

      {open && (
        <div style={{ padding: '16px 20px 20px' }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 16px', lineHeight: 1.5 }}>
            Transcrição completa do workshop em texto. Cole no ChatGPT, Claude ou onde preferir.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={handleCopy}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '9px 16px',
                background: copied ? 'var(--green-subtle)' : 'var(--surface)',
                border: `1px solid ${copied ? 'var(--green-20)' : 'var(--border-2)'}`,
                borderRadius: 'var(--radius)',
                fontSize: 13,
                fontWeight: 600,
                color: copied ? 'var(--green)' : 'var(--text)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {copied ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M2.5 6.5l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Copiado!
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <rect x="1" y="4" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                    <path d="M4 4V2.5A1.5 1.5 0 0 1 5.5 1H10.5A1.5 1.5 0 0 1 12 2.5V7.5A1.5 1.5 0 0 1 10.5 9H9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                  Copiar texto
                </>
              )}
            </button>

            <a
              href="/downloads/transcricao-workshop.txt"
              download="transcricao-workshop.txt"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '9px 16px',
                background: 'var(--green)',
                border: '1px solid transparent',
                borderRadius: 'var(--radius)',
                fontSize: 13,
                fontWeight: 700,
                color: '#0A0A0A',
                textDecoration: 'none',
                transition: 'opacity 0.15s',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M6.5 1v8M3.5 6.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1 10.5h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Baixar .txt
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
