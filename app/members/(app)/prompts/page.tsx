export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { CatalogProduct } from '@/lib/supabase/types'
import { PromptCard, type ClubPrompt } from '@/components/prompt-card'

export default async function PromptsPage() {
  const supabase = await createClient()

  const { data: catalog = [] } = await supabase.rpc('get_catalog_with_access')
  const products = (catalog ?? []) as CatalogProduct[]
  const hasClub = products.some((p) => p.product_slug === 'club' && p.has_access)

  const { data: promptsData = [] } = hasClub
    ? await supabase.rpc('get_club_prompts')
    : { data: [] }
  const prompts = (promptsData ?? []) as ClubPrompt[]

  return (
    <div className="page-wrap" style={{ maxWidth: 760 }}>
      <div className="fade-up" style={{ marginBottom: 26 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 26,
          color: 'var(--text)',
          margin: 0,
        }}>
          Prompts
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.55, maxWidth: 560 }}>
          Os prompts das IAs de venda que rodam de verdade nos projetos do Gobatto — Mila, Camila e Renata —
          adaptados pra você usar de base. Troca os <code style={{ background: 'var(--surface)', padding: '2px 6px', borderRadius: 3, fontSize: 12.5 }}>[PLACEHOLDERS]</code> pelos
          dados do teu negócio e o método vai junto.
        </p>
      </div>

      {!hasClub ? (
        <div className="fade-up fade-up-1" style={{
          background: 'var(--bg-2)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '36px 28px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 30, marginBottom: 12 }}>🔒</div>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--text)', margin: 0 }}>
            Biblioteca exclusiva do Push Club
          </p>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', margin: '8px auto 22px', maxWidth: 400, lineHeight: 1.55 }}>
            Os prompts das IAs de venda que o Gobatto opera em produção ficam liberados pra quem é membro ativo.
          </p>
          <Link
            href="/club"
            style={{
              display: 'inline-block',
              background: 'var(--green)',
              color: '#0A0A0A',
              padding: '12px 26px',
              borderRadius: 'var(--radius)',
              fontSize: 13.5,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Conhecer o Push Club
          </Link>
        </div>
      ) : prompts.length === 0 ? (
        <p className="fade-up fade-up-1" style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          Os primeiros prompts estão a caminho. Volta em breve.
        </p>
      ) : (
        <div className="fade-up fade-up-1" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {prompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      )}
    </div>
  )
}
