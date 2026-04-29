'use client'

import { useState } from 'react'

export function AulaBlock({ label, children, defaultOpen = true }: {
  label: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div style={{ marginBottom: 36 }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: 10,
          marginBottom: open ? 16 : 0,
          borderBottom: '1px solid var(--border)',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}
        >
          {label}
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
      {open && children}
    </div>
  )
}
