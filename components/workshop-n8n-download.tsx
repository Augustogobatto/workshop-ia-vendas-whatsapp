'use client'

import { useState } from 'react'

export function N8nDownload() {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const res = await fetch('/downloads/n8n-workshop.json')
    const text = await res.text()
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div
      style={{
        padding: '24px',
        background: 'var(--bg-2)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text)',
            margin: '0 0 6px',
          }}
        >
          Workflow completo — n8n
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
          Importe esse JSON direto no seu n8n. Todas as automações do workshop já configuradas.
        </p>
      </div>

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
              Copiar JSON
            </>
          )}
        </button>

        <a
          href="/downloads/n8n-workshop.json"
          download="n8n-workshop.json"
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
          Baixar .json
        </a>
      </div>
    </div>
  )
}
