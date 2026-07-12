'use client'

import { useState } from 'react'
import { generateMcpToken } from './actions'

export function ConnectPanel({
  clubActive,
  existingToken,
}: {
  clubActive: boolean
  existingToken: { created_at: string; last_used_at: string | null } | null
}) {
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    const r = await generateMcpToken()
    setLoading(false)
    if (r.ok) setUrl(r.url)
    else setError(r.error)
  }

  async function handleCopy() {
    if (!url) return
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!clubActive) {
    return (
      <div
        style={{
          padding: '18px 20px',
          background: 'var(--bg-2)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          fontSize: 13.5,
          color: 'var(--text-muted)',
          lineHeight: 1.6,
        }}
      >
        O conector do Claude é um benefício exclusivo de <strong style={{ color: 'var(--text)' }}>assinantes ativos do Club</strong>.
        Assine o Club pra liberar o seu.
      </div>
    )
  }

  return (
    <div
      style={{
        padding: '20px',
        background: 'var(--bg-2)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
      }}
    >
      {!url && (
        <>
          {existingToken && (
            <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.5 }}>
              Você já tem um conector ativo (criado em{' '}
              {new Date(existingToken.created_at).toLocaleDateString('pt-BR')}
              {existingToken.last_used_at
                ? `, último uso em ${new Date(existingToken.last_used_at).toLocaleDateString('pt-BR')}`
                : ', nunca usado'}
              ). Gerar um novo <strong style={{ color: 'var(--text)' }}>desativa o atual</strong>.
            </p>
          )}
          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              padding: '10px 18px',
              background: 'var(--green)',
              color: '#0A0A0A',
              border: 'none',
              borderRadius: 'var(--radius)',
              fontSize: 13.5,
              fontWeight: 600,
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Gerando…' : existingToken ? 'Gerar novo conector' : 'Gerar meu conector'}
          </button>
        </>
      )}

      {url && (
        <>
          <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500, marginBottom: 10 }}>
            Pronto! Copia a URL abaixo — ela aparece <u>só agora</u>:
          </p>
          <div
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'stretch',
              marginBottom: 18,
            }}
          >
            <code
              style={{
                flex: 1,
                padding: '10px 12px',
                background: 'var(--surface)',
                border: '1px solid var(--border-2)',
                borderRadius: 'var(--radius)',
                fontSize: 11.5,
                color: 'var(--text-muted)',
                overflowX: 'auto',
                whiteSpace: 'nowrap',
              }}
            >
              {url}
            </code>
            <button
              onClick={handleCopy}
              style={{
                padding: '0 16px',
                background: copied ? 'var(--green)' : 'var(--surface)',
                color: copied ? '#0A0A0A' : 'var(--text)',
                border: '1px solid var(--border-2)',
                borderRadius: 'var(--radius)',
                fontSize: 12.5,
                fontWeight: 500,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7 }}>
            <strong style={{ color: 'var(--text)' }}>Como conectar (Claude Desktop):</strong>
            <ol style={{ margin: '6px 0 0 18px', padding: 0 }}>
              <li>Abre o <strong style={{ color: 'var(--text)' }}>Claude Desktop</strong></li>
              <li>Na conversa, clica no <strong style={{ color: 'var(--text)' }}>+</strong> — o mesmo botão de anexar foto ou arquivo</li>
              <li>Vai em <em>Conectores</em> → <em>+ Adicionar conector</em> → <em>Adicionar conector personalizado</em></li>
              <li>
                Em <strong style={{ color: 'var(--text)' }}>Nome</strong>, coloca:{' '}
                <code
                  onClick={() => navigator.clipboard.writeText('🦾 Push Club — Gobatto')}
                  title="Clica pra copiar"
                  style={{
                    padding: '2px 8px',
                    background: 'var(--surface)',
                    border: '1px solid var(--border-2)',
                    borderRadius: 4,
                    fontSize: 12,
                    color: 'var(--text)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  🦾 Push Club — Gobatto
                </code>{' '}
                <span style={{ fontSize: 11.5, color: 'var(--text-dim)' }}>(clica pra copiar)</span>
              </li>
              <li>Em <strong style={{ color: 'var(--text)' }}>URL</strong>, cola a URL que você copiou acima</li>
              <li>Confirma, abre um <strong style={{ color: 'var(--text)' }}>chat novo</strong> e pergunta qualquer coisa das aulas — ele responde citando o Club 🦾</li>
            </ol>
            <p style={{ marginTop: 10, fontSize: 12, color: 'var(--text-dim)' }}>
              No claude.ai (navegador) o caminho é: <em>Settings</em> → <em>Connectors</em> → <em>Add custom connector</em> — mesmo nome, mesma URL.
            </p>
          </div>
        </>
      )}

      {error && (
        <p style={{ fontSize: 13, color: '#e5484d', marginTop: 12 }}>{error}</p>
      )}
    </div>
  )
}
