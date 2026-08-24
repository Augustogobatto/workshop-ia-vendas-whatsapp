'use client'

import { useState } from 'react'

export default function CopiarComando({ comando }: { comando: string }) {
  const [copiado, setCopiado] = useState(false)

  async function copiar() {
    try {
      await navigator.clipboard.writeText(comando)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 1800)
    } catch {
      // clipboard bloqueado (http, permissao): o texto continua selecionavel
    }
  }

  return (
    <div
      style={{
        marginTop: 22,
        background: '#0B0B0B',
        border: '1px solid var(--border-2)',
        borderRadius: 'var(--radius)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 14px 14px 18px',
        overflowX: 'auto',
      }}
    >
      <code
        style={{
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: 13.5,
          color: '#D6D6D6',
          whiteSpace: 'nowrap',
          flex: 1,
        }}
      >
        {comando}
      </code>
      <button
        onClick={copiar}
        style={{
          flexShrink: 0,
          background: copiado ? '#1F1F1F' : 'var(--surface)',
          color: copiado ? '#FFFFFF' : '#B4B4B4',
          border: '1px solid var(--border-2)',
          borderRadius: 'var(--radius-sm)',
          padding: '7px 13px',
          fontSize: 12.5,
          cursor: 'pointer',
          fontFamily: 'var(--font-ui)',
        }}
      >
        {copiado ? 'copiado' : 'copiar'}
      </button>
    </div>
  )
}
