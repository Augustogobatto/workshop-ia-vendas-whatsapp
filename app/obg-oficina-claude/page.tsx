import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Compra confirmada — Oficina Claude Code',
}

export default function ObrigadoOficinaClaudePage() {
  return (
    <main
      style={{
        minHeight: '100dvh',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        gap: 32,
        textAlign: 'center',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
        <span style={{ fontSize: 48 }}>🎉</span>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 'clamp(32px, 8vw, 64px)',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            color: 'var(--text)',
          }}
        >
          Compra confirmada!
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 'clamp(16px, 3vw, 20px)',
            color: 'var(--text-muted)',
            maxWidth: 480,
          }}
        >
          Bem-vindo(a) à Oficina Claude Code. Você vai receber uma mensagem no WhatsApp com os próximos passos em instantes.
        </p>
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: 440,
          background: 'var(--bg-2)',
          border: '1px solid var(--border-2)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          textAlign: 'left',
        }}
      >
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Proximos passos
        </p>
        {[
          'Fique de olho no WhatsApp — o Claudinei vai te mandar o acesso.',
          'Complete as missoes pre-aula para chegar preparado(a).',
          'Nos vemos na oficina ao vivo!',
        ].map((step, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <span
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: 'var(--green-20)',
                color: 'var(--green)',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: 2,
              }}
            >
              {i + 1}
            </span>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, color: 'var(--text)', lineHeight: 1.5 }}>
              {step}
            </p>
          </div>
        ))}
      </div>
    </main>
  )
}
