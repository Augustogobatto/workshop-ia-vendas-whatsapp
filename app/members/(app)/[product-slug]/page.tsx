export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Module, Lesson, LessonProgress } from '@/lib/supabase/types'
import { LessonRow } from '@/components/lesson-row'
import { WorkshopBanner, WorkshopChecklist } from '@/components/workshop-banner'
import { N8nDownload } from '@/components/workshop-n8n-download'
import { AulaBlock } from '@/components/aula-block'
import { WorkshopTranscriptCopy } from '@/components/workshop-transcript-copy'

interface PageProps {
  params: Promise<{ 'product-slug': string }>
}

export default async function CoursePage({ params }: PageProps) {
  const { 'product-slug': productSlug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/members/login')

  // Get product
  const { data: product } = await supabase
    .from('products')
    .select('id, name, slug, description, type')
    .eq('slug', productSlug)
    .eq('is_active', true)
    .single()

  if (!product) notFound()

  // Check access via catalog RPC
  const { data: catalog } = await supabase.rpc('get_catalog_with_access')
  const productAccess = (catalog ?? []).find(
    (p: { product_slug: string; has_access: boolean }) => p.product_slug === productSlug
  )

  const hasAccess = productAccess?.has_access ?? false

  // Get modules + lessons
  const { data: modules = [] } = await supabase
    .from('modules')
    .select('id, name, slug, sort_order, description')
    .eq('product_id', product.id)
    .eq('is_published', true)
    .order('sort_order')

  const moduleIds = (modules ?? []).map((m: { id: string }) => m.id)

  const { data: allLessons = [] } = moduleIds.length
    ? await supabase
        .from('lessons')
        .select('id, module_id, name, slug, sort_order, content_type, duration_seconds, is_free, description')
        .in('module_id', moduleIds)
        .eq('is_published', true)
        .order('sort_order')
    : { data: [] }

  // Get lead id for progress
  const { data: lead } = await supabase
    .from('leads')
    .select('id')
    .single()

  const { data: progressRows = [] } = lead
    ? await supabase
        .from('lesson_progress')
        .select('lesson_id, status, completed_at, progress_pct')
        .eq('lead_id', lead.id)
    : { data: [] }

  const progressMap = new Map(
    (progressRows ?? []).map((p: LessonProgress) => [p.lesson_id, p])
  )

  const lessonsByModule = new Map<string, Lesson[]>()
  for (const lesson of (allLessons ?? []) as Lesson[]) {
    const arr = lessonsByModule.get(lesson.module_id) ?? []
    arr.push(lesson)
    lessonsByModule.set(lesson.module_id, arr)
  }

  const totalLessons = (allLessons ?? []).length
  const completedLessons = (progressRows ?? []).filter(
    (p: LessonProgress) => p.status === 'completed'
  ).length
  const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  return (
    <div className="page-wrap" style={{ maxWidth: 800 }}>

      {/* Breadcrumb */}
      <div className="fade-up" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, fontSize: 12.5, color: 'var(--text-muted)' }}>
          <Link href="/members" className="link-muted">
            Dashboard
          </Link>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
            <path d="M4.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <span style={{ color: 'var(--text-dim)' }}>{product.name}</span>
        </div>

        <h1
          className="heading-lg"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            color: 'var(--text)',
            lineHeight: 1.1,
            marginBottom: 12,
          }}
        >
          {product.name}
        </h1>

        {product.description && (
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '65ch', marginBottom: 20 }}>
            {product.description}
          </p>
        )}

        {/* Progress strip */}
        {hasAccess && totalLessons > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="progress-bar" style={{ flex: 1, maxWidth: 200 }}>
              <div className="progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <span style={{ fontSize: 12, color: progressPct === 100 ? 'var(--green)' : 'var(--text-muted)', fontWeight: 500 }}>
              {progressPct === 100 ? '✓ Concluído' : `${progressPct}% · ${completedLessons}/${totalLessons} aulas`}
            </span>
          </div>
        )}
      </div>

      {hasAccess && productSlug === 'workshop-ia-vendas-whatsapp' && (
        <>
          <WorkshopChecklist />

          <AulaBlock label="Pré-Configurações" defaultOpen={false}>
            <LoomEmbed id="71b85bb424ea46eaaea17c8c3d3b98e9" label="🦾 IA Revolution — Bem-vindo" />
            <LoomEmbed id="460cb65da690425c9fb2c488cb14a1c9" label="🦾 IA Revolution — VPS Setup · n8n + Chatwoot" />
          </AulaBlock>

          <AulaBlock label="Gravação do Workshop">
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 16px', lineHeight: 1.5 }}>
              em breve o Gobatto vai cortar essa aula e dividir em partes pra ficar melhor a compreensão.
            </p>
            <LoomEmbed id="d9f5071486ed40f6a2bb4d1d26eed00b" />
            <WorkshopTranscriptCopy />
          </AulaBlock>

          <AulaBlock label="Automação n8n — JSON Completo" defaultOpen={false}>
            <N8nDownload />
          </AulaBlock>

          <AulaBlock label="Ferramentas N8N">
            <LoomEmbed id="859e54f205954355a9844ddb830248a3" label="Como transferir conversas para humano" />
            <LoomEmbed id="d5ea5cdefac34f9db7423307ee2fa3ce" label="Como configurar OpenAI no N8N — Imagem e Áudio" />
          </AulaBlock>

          <AulaBlock label="Bônus">
            <LoomEmbed id="522631959a394c48bbfff49e80b37c68" label="Conectando Supabase ao Claude Desktop 🔥" />
          </AulaBlock>

          <AulaBlock label="Oferta do Club. Fundadores.">
            <div style={{
              background: 'rgba(255,45,45,0.06)',
              border: '1px solid rgba(255,45,45,0.2)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px 20px',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: '#FF2D2D', flexShrink: 0,
                boxShadow: '0 0 6px #FF2D2D',
              }} />
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#FF2D2D' }}>
                Oferta por tempo limitado — exclusiva pra quem fez o workshop
              </span>
            </div>
            <LoomEmbed id="d8ea57f7b0fa4debb738c47a54831460" />
            <a
              href="https://ia.augustogobatto.com/club"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '14px 28px',
                background: 'var(--green)',
                color: '#0A0A0A',
                borderRadius: 'var(--radius)',
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: '0.03em',
                textDecoration: 'none',
                marginTop: 20,
                boxShadow: '0 0 24px rgba(0,255,136,0.25)',
              }}
            >
              Quero fazer parte do Club. Fundadores →
            </a>
          </AulaBlock>
        </>
      )}

      {/* Module list */}
      <div className="fade-up fade-up-1" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {(modules ?? []).length > 0 && (
          (modules as Module[]).map((mod, modIdx) => {
            const lessons = lessonsByModule.get(mod.id) ?? []
            const modCompleted = lessons.filter(
              (l) => progressMap.get(l.id)?.status === 'completed'
            ).length

            return (
              <div key={mod.id}>
                {/* Module header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: 10,
                    marginBottom: 4,
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: 'var(--text-dim)',
                        minWidth: 24,
                      }}
                    >
                      M{modIdx + 1}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 13,
                        fontWeight: 600,
                        letterSpacing: '0.03em',
                        textTransform: 'uppercase',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {mod.name}
                    </span>
                  </div>
                  {lessons.length > 0 && (
                    <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                      {modCompleted}/{lessons.length}
                    </span>
                  )}
                </div>

                {/* Lesson rows */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {lessons.map((lesson, lessonIdx) => {
                    const progress = progressMap.get(lesson.id)
                    const isCompleted = progress?.status === 'completed'
                    const isInProgress = progress?.status === 'in_progress'
                    const canAccess = hasAccess || lesson.is_free

                    return (
                      <LessonRow
                        key={lesson.id}
                        lesson={lesson}
                        progress={{ isCompleted, isInProgress }}
                        canAccess={canAccess}
                        productSlug={productSlug}
                        moduleSlug={mod.slug}
                        lessonNumber={lessonIdx + 1}
                      />
                    )
                  })}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}


function LoomEmbed({ id, label }: { id: string; label?: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      {label && (
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text)',
            marginBottom: 10,
            marginTop: 0,
          }}
        >
          {label}
        </p>
      )}
      <div
        style={{
          position: 'relative',
          paddingBottom: '56.25%',
          background: '#000',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}
      >
        <iframe
          src={`https://www.loom.com/embed/${id}?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true`}
          allowFullScreen
          style={{
            position: 'absolute',
            top: 0, left: 0,
            width: '100%', height: '100%',
            border: 'none',
          }}
        />
      </div>
    </div>
  )
}
