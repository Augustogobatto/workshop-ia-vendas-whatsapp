'use client'

import Link from 'next/link'
import type { CatalogProduct } from '@/lib/supabase/types'
import { formatPrice } from '@/lib/utils'

const TYPE_LABEL: Record<string, string> = {
  course: 'Workshop',
  workshop: 'Workshop',
  mentorship: 'Mentoria',
  community: 'Comunidade',
  tool: 'Ferramenta',
}

function WrenchIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ verticalAlign: '-2px', marginRight: 6 }} aria-hidden="true">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  )
}

export function OwnedProductCard({ product }: { product: CatalogProduct }) {
  return (
    <Link
      href={`/members/${product.product_slug}`}
      style={{
        display: 'block',
        padding: '24px 28px',
        background: 'var(--bg-2)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        textDecoration: 'none',
        transition: 'border-color 0.2s, background 0.2s',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-2)'
        e.currentTarget.style.background = 'var(--surface)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.background = 'var(--bg-2)'
      }}
    >
      {/* Type label */}
      <div style={{
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        marginBottom: 10,
        fontFamily: 'var(--font-display)',
      }}>
        {product.product_type === 'tool' && <WrenchIcon />}
        {TYPE_LABEL[product.product_type] ?? product.product_type}
      </div>

      {/* Course name */}
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 20,
        fontWeight: 700,
        color: 'var(--text)',
        lineHeight: 1.2,
        letterSpacing: '-0.02em',
        marginBottom: 20,
      }}>
        {product.product_name}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            width: 5, height: 5,
            borderRadius: '50%',
            background: 'var(--text-muted)',
            display: 'inline-block',
          }} />
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)', letterSpacing: '0.02em' }}>
            Acesso ativo
          </span>
        </div>
        <span style={{
          fontSize: 12,
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-display)',
          letterSpacing: '0.04em',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}>
          Acessar
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M4.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </div>
    </Link>
  )
}

export function LockedProductCard({ product }: { product: CatalogProduct }) {
  return (
    <div style={{
      display: 'block',
      padding: '24px 28px',
      background: 'var(--bg-2)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      opacity: 0.6,
    }}>
      <div style={{
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--text-dim)',
        marginBottom: 10,
        fontFamily: 'var(--font-display)',
      }}>
        {product.product_type === 'tool' && <WrenchIcon />}
        {TYPE_LABEL[product.product_type] ?? product.product_type}
      </div>

      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 20,
        fontWeight: 700,
        color: 'var(--text-muted)',
        lineHeight: 1.2,
        letterSpacing: '-0.02em',
        marginBottom: 20,
      }}>
        {product.product_name}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11.5, color: 'var(--text-dim)' }}>
          {product.price_cents ? formatPrice(product.price_cents) : 'Indisponível'}
        </span>
        <a
          href={product.product_slug === 'workshop-ia-vendas-whatsapp'
            ? 'http://ia.augustogobatto.com/'
            : 'https://wa.me/5519988922649'}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{
            fontSize: 12,
            color: 'var(--text)',
            fontFamily: 'var(--font-display)',
            letterSpacing: '0.04em',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          Adquirir acesso
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M4.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>
    </div>
  )
}
