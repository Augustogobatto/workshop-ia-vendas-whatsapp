'use client'

import { useState, useTransition } from 'react'
import { abrirPortalDeCobranca } from './actions'

export function PortalButton({ label = 'Gerenciar assinatura' }: { label?: string }) {
  const [erro, setErro] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function abrir() {
    setErro(null)
    startTransition(async () => {
      const r = await abrirPortalDeCobranca()
      if (r.ok) window.location.href = r.url
      else setErro(r.error)
    })
  }

  return (
    <div>
      <button
        onClick={abrir}
        disabled={pending}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'var(--green)',
          color: '#0A0A0A',
          border: 'none',
          padding: '11px 22px',
          borderRadius: 'var(--radius)',
          fontFamily: 'var(--font-display)',
          fontSize: 13.5,
          fontWeight: 600,
          cursor: pending ? 'wait' : 'pointer',
          opacity: pending ? 0.6 : 1,
          transition: 'opacity 0.15s',
        }}
      >
        {pending ? 'Abrindo…' : label}
        {!pending && (
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M5 2.5 9.5 7 5 11.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '10px 0 0', lineHeight: 1.5, maxWidth: 440 }}>
        Abre o portal seguro da Stripe: trocar o cartão, baixar as faturas ou cancelar.
      </p>

      {erro && (
        <p style={{ fontSize: 12.5, color: 'var(--red)', margin: '10px 0 0' }}>{erro}</p>
      )}
    </div>
  )
}
