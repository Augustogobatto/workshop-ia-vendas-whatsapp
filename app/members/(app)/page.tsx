export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import type { CatalogProduct } from '@/lib/supabase/types'
import { OwnedProductCard, LockedProductCard } from '@/components/product-cards'
import { Greeting } from '@/components/greeting'
import { BannerList, type Banner } from '@/components/banners'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: lead } = await supabase
    .from('leads')
    .select('first_name, name, email')
    .single()

  const { data: catalog = [] } = await supabase.rpc('get_catalog_with_access')
  const products = (catalog ?? []) as CatalogProduct[]

  const owned = products.filter((p) => p.has_access)
  const available = products.filter((p) => !p.has_access)
  const ownedSlugs = new Set(owned.map((p) => p.product_slug))

  const { data: allBanners = [] } = await supabase
    .from('banners')
    .select('id, message, cta_text, cta_url, discount_pct, style, target_has_slug, target_lacks_slug')
    .eq('active', true)
    .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())

  const visibleBanners = (allBanners as (Banner & { target_has_slug: string | null; target_lacks_slug: string | null })[])
    .filter((b) => {
      if (b.target_has_slug && !ownedSlugs.has(b.target_has_slug)) return false
      if (b.target_lacks_slug && ownedSlugs.has(b.target_lacks_slug)) return false
      return true
    })

  return (
    <div className="page-wrap" style={{ maxWidth: 900 }}>

      {/* Header */}
      <div className="fade-up" style={{ marginBottom: 28 }}>
        <Greeting name={lead?.first_name ?? lead?.name} />
      </div>

      <BannerList banners={visibleBanners} />

      {/* Owned products */}
      {owned.length > 0 ? (
        <section className="fade-up fade-up-1" style={{ marginBottom: 52 }}>
          <SectionLabel>Seus workshops</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {owned.map((product) => (
              <OwnedProductCard key={product.product_id} product={product} />
            ))}
          </div>
        </section>
      ) : (
        <section className="fade-up fade-up-1" style={{ marginBottom: 52 }}>
          <SectionLabel>Seus workshops</SectionLabel>
          <div
            style={{
              padding: '32px 24px',
              background: 'var(--bg-2)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>
              Você ainda não tem workshops. Confira os disponíveis abaixo.
            </p>
          </div>
        </section>
      )}

      {/* Available (locked) products */}
      {available.length > 0 && (
        <section className="fade-up fade-up-2">
          <SectionLabel>Próximos</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {available.map((product) => (
              <LockedProductCard key={product.product_id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 10.5,
        fontWeight: 600,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--text-dim)',
        marginBottom: 10,
        paddingLeft: 4,
      }}
    >
      {children}
    </div>
  )
}

