'use client'

import { useState } from 'react'

export interface ClubSkill {
  id: string
  name: string
  slug: string
  emoji: string | null
  description: string | null
  body_md: string
  sort_order: number
  updated_at: string
}

export function SkillCard({ skill }: { skill: ClubSkill }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleCopy(e: React.MouseEvent) {
    e.stopPropagation()
    await navigator.clipboard.writeText(skill.body_md)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownload(e: React.MouseEvent) {
    e.stopPropagation()
    const blob = new Blob([skill.body_md], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'SKILL.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  const btnStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-2)',
    background: 'var(--surface)',
    color: 'var(--text)',
    fontSize: 12.5,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'var(--font-ui)',
    transition: 'background 0.15s, border-color 0.15s',
  }

  return (
    <div
      style={{
        background: 'var(--bg-2)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '16px 18px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          fontFamily: 'var(--font-ui)',
        }}
      >
        <span style={{ fontSize: 22, flexShrink: 0, lineHeight: 1 }}>{skill.emoji ?? '⚡'}</span>
        <span style={{ minWidth: 0, flex: 1 }}>
          <span style={{
            display: 'block',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 15,
            color: 'var(--text)',
            lineHeight: 1.3,
          }}>
            /{skill.slug}
          </span>
          {skill.description && (
            <span style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginTop: 3, lineHeight: 1.45 }}>
              {skill.description}
            </span>
          )}
        </span>
        <svg
          width="14" height="14" viewBox="0 0 14 14" fill="none"
          style={{
            flexShrink: 0,
            color: 'var(--text-dim)',
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.18s',
          }}
        >
          <path d="M3 5.5 7 9.5l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div style={{ borderTop: '1px solid var(--border)' }}>
          <div style={{
            display: 'flex',
            gap: 8,
            padding: '12px 18px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--bg-3)',
          }}>
            <button onClick={handleCopy} style={btnStyle}>
              {copied ? (
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                  <path d="M2.5 7.5 5.5 10.5 11.5 3.5" stroke="var(--green)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                  <rect x="4.5" y="4.5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M9.5 4.5v-2A1.5 1.5 0 0 0 8 1H3a1.5 1.5 0 0 0-1.5 1.5v5A1.5 1.5 0 0 0 3 9h1.5" stroke="currentColor" strokeWidth="1.3"/>
                </svg>
              )}
              {copied ? 'Copiado' : 'Copiar SKILL.md'}
            </button>
            <button onClick={handleDownload} style={btnStyle}>
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M7 1.5v8M4 6.5 7 9.5l3-3M2 12.5h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Baixar .md
            </button>
          </div>
          <pre style={{
            margin: 0,
            padding: '16px 18px',
            fontSize: 12.5,
            lineHeight: 1.6,
            color: 'var(--text-muted)',
            overflowX: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            maxHeight: 480,
            overflowY: 'auto',
          }}>
            {skill.body_md}
          </pre>
        </div>
      )}
    </div>
  )
}
