import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Club Apresentação',
}

export default function ClubPage() {
  return (
    <main
      style={{
        minHeight: '100dvh',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        gap: 48,
      }}
    >
      <h1
        className="fade-up"
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 'clamp(96px, 22vw, 220px)',
          letterSpacing: '-0.04em',
          lineHeight: 0.88,
          color: 'var(--text)',
          textAlign: 'center',
          userSelect: 'none',
        }}
      >
        Club
      </h1>

      <div
        className="fade-up fade-up-1"
        style={{ display: 'flex', gap: 10 }}
      >
        <a href="https://buy.stripe.com/9B6bJ22D27tjc5Og849fW0c" className="club-btn">
          Anual — R$500/ano
        </a>
        <a href="https://buy.stripe.com/6oUcN62D24h7b1KbRO9fW0b" className="club-btn">
          Mensal — R$50/mês
        </a>
      </div>
    </main>
  )
}
