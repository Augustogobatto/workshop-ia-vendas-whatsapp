'use client'

import Link from 'next/link'
import type { CatalogProduct } from '@/lib/supabase/types'
import { formatPrice } from '@/lib/utils'

const TYPE_LABEL: Record<string, string> = {
  course: 'Workshop',
  workshop: 'Workshop',
  mentorship: 'Mentoria',
  community: 'Comunidade',
}

export function OwnedProductCard({ product }: { product: CatalogProduct }) {
  return (
    <Link
      href={`/members/${product.product_slug}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 18px',
        background: 'var(--bg-2)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        transition: 'background 0.15s, border-color 0.15s',
        gap: 16,
        textDecoration: 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--surface)'
        e.currentTarget.style.borderColor = 'var(--border-2)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--bg-2)'
        e.currentTarget.style.borderColor = 'var(--border)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <div style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 'var(--radius)', background: 'var(--green-10)', border: '1px solid var(--green-20)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 4.5C2 3.67 2.67 3 3.5 3h9C13.33 3 14 3.67 14 4.5v7c0 .83-.67 1.5-1.5 1.5h-9A1.5 1.5 0 0 1 2 11.5v-7Z" stroke="var(--green)" strokeWidth="1.4"/>
            <path d="M6.5 6.5 9 8l-2.5 1.5v-3Z" fill="var(--green)"/>
          </svg>
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text)', lineHeight: 1.2, marginBottom: 2 }}>{product.product_name}</div>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{TYPE_LABEL[product.product_type] ?? product.product_type}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 500 }}>Acesso ativo</span>
          <span style={{ width: 5, height: 5, background: 'var(--green)', borderRadius: '50%' }} />
        </div>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: 'var(--text-dim)', flexShrink: 0 }}>
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </Link>
  )
}

export function LockedProductCard({ product }: { product: CatalogProduct }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <div style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 'var(--radius)', background: 'var(--surface-2)', border: '1px solid var(--border-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="2" y="6" width="10" height="7" rx="1.5" stroke="var(--text-muted)" strokeWidth="1.3"/>
            <path d="M4.5 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke="var(--text-muted)" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text)', lineHeight: 1.2, marginBottom: 2 }}>{product.product_name}</div>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
            {TYPE_LABEL[product.product_type] ?? product.product_type}
            {product.price_cents ? ` · ${formatPrice(product.price_cents)}` : ''}
          </div>
        </div>
      </div>
      <a
        href={product.product_slug === 'workshop-ia-vendas-whatsapp'
          ? 'http://ia.augustogobatto.com/'
          : 'https://wa.me/5519988922649'}
        target="_blank"
        rel="noopener noreferrer"
        style={{ padding: '10px 14px', background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius)', fontSize: 12, fontWeight: 500, cursor: 'pointer', textDecoration: 'none', flexShrink: 0, transition: 'background 0.15s', whiteSpace: 'nowrap' }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface)')}
      >
        Adquirir acesso →
      </a>
    </div>
  )
}
