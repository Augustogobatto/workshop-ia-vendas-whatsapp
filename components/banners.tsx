'use client'

import Link from 'next/link'

export interface Banner {
  id: string
  message: string
  cta_text: string | null
  cta_url: string | null
  discount_pct: number | null
  style: 'default' | 'warning' | 'promo'
}

const STYLES = {
  default: {
    bg: 'var(--green-subtle)',
    border: 'var(--green-20)',
    dot: 'var(--green)',
    label: 'var(--green)',
    cta_bg: 'var(--green)',
    cta_color: '#0A0A0A',
  },
  warning: {
    bg: 'rgba(255,214,10,0.06)',
    border: 'rgba(255,214,10,0.2)',
    dot: 'var(--yellow)',
    label: 'var(--yellow)',
    cta_bg: 'var(--yellow)',
    cta_color: '#0A0A0A',
  },
  promo: {
    bg: 'rgba(255,69,58,0.06)',
    border: 'rgba(255,69,58,0.2)',
    dot: 'var(--red)',
    label: 'var(--red)',
    cta_bg: 'var(--red)',
    cta_color: '#fff',
  },
}

export function BannerList({ banners }: { banners: Banner[] }) {
  if (!banners.length) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
      {banners.map((b) => {
        const s = STYLES[b.style] ?? STYLES.default
        return (
          <div
            key={b.id}
            className="fade-up"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              padding: '12px 18px',
              background: s.bg,
              border: `1px solid ${s.border}`,
              borderRadius: 'var(--radius-lg)',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
              <span
                className="pulse"
                style={{ width: 7, height: 7, background: s.dot, borderRadius: '50%', flexShrink: 0 }}
              />
              <span style={{ fontSize: 13.5, color: 'var(--text)', lineHeight: 1.45 }}>
                {b.discount_pct && (
                  <span style={{ fontWeight: 700, color: s.label, marginRight: 6 }}>
                    -{b.discount_pct}%
                  </span>
                )}
                {b.message}
              </span>
            </div>

            {b.cta_text && b.cta_url && (
              b.cta_url.startsWith('/') ? (
                <Link
                  href={b.cta_url}
                  style={{
                    padding: '7px 14px',
                    background: s.cta_bg,
                    color: s.cta_color,
                    borderRadius: 'var(--radius)',
                    fontSize: 12.5,
                    fontWeight: 700,
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {b.cta_text}
                </Link>
              ) : (
                <a
                  href={b.cta_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '7px 14px',
                    background: s.cta_bg,
                    color: s.cta_color,
                    borderRadius: 'var(--radius)',
                    fontSize: 12.5,
                    fontWeight: 700,
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {b.cta_text}
                </a>
              )
            )}
          </div>
        )
      })}
    </div>
  )
}
