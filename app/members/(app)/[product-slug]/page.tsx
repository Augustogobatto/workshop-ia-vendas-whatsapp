export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Module, Lesson, LessonProgress } from '@/lib/supabase/types'
import { LessonRow } from '@/components/lesson-row'

interface PageProps {
  params: Promise<{ 'product-slug': string }>
}

export default async function CoursePage({ params }: PageProps) {
  const { 'product-slug': productSlug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/members/login')

  const { data: product } = await supabase
    .from('products')
    .select('id, name, slug, description, type')
    .eq('slug', productSlug)
    .eq('is_active', true)
    .single()

  if (!product) notFound()

  const { data: catalog } = await supabase.rpc('get_catalog_with_access')
  const productAccess = (catalog ?? []).find(
    (p: { product_slug: string; has_access: boolean }) => p.product_slug === productSlug
  )
  const hasAccess = productAccess?.has_access ?? false

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

  const { data: lead } = await supabase.from('leads').select('id').single()

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
  const moduleByLessonId = new Map<string, Module>()
  for (const lesson of (allLessons ?? []) as Lesson[]) {
    const arr = lessonsByModule.get(lesson.module_id) ?? []
    arr.push(lesson)
    lessonsByModule.set(lesson.module_id, arr)
    const mod = (modules as Module[]).find(m => m.id === lesson.module_id)
    if (mod) moduleByLessonId.set(lesson.id, mod)
  }

  const totalLessons = (allLessons ?? []).length
  const completedLessons = (progressRows ?? []).filter(
    (p: LessonProgress) => p.status === 'completed'
  ).length
  const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  const nextLesson = (allLessons as Lesson[]).find(
    l => (progressMap.get(l.id)?.status ?? 'not_started') !== 'completed'
  ) ?? null
  const nextModule = nextLesson ? moduleByLessonId.get(nextLesson.id) ?? null : null

  return (
    <div className="page-wrap" style={{ maxWidth: 800 }}>

      {/* Breadcrumb + header */}
      <div className="fade-up" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, fontSize: 12.5, color: 'var(--text-muted)' }}>
          <Link href="/members" className="link-muted">Dashboard</Link>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
            <path d="M4.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <span style={{ color: 'var(--text-dim)' }}>{product.name}</span>
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          letterSpacing: '-0.01em',
          color: 'var(--text)',
          lineHeight: 1.1,
          marginBottom: 12,
          fontSize: 'clamp(22px, 4vw, 32px)',
        }}>
          {product.name}
        </h1>

        {product.description && (
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '65ch', marginBottom: 20 }}>
            {product.description}
          </p>
        )}

        {hasAccess && totalLessons > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div className="progress-bar" style={{ flex: 1, maxWidth: 200 }}>
              <div className="progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <span style={{ fontSize: 12, color: progressPct === 100 ? 'var(--green)' : 'var(--text-muted)', fontWeight: 500 }}>
              {progressPct === 100 ? '✓ Concluído' : `${progressPct}% · ${completedLessons}/${totalLessons} aulas`}
            </span>
            {nextLesson && nextModule && progressPct < 100 && (
              <Link
                href={`/members/${productSlug}/${nextModule.slug}/${nextLesson.slug}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 14px',
                  background: 'var(--green)',
                  color: '#0A0A0A',
                  borderRadius: 'var(--radius)',
                  fontSize: 12,
                  fontWeight: 700,
                  textDecoration: 'none',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  fontFamily: 'var(--font-display)',
                }}
              >
                {progressPct === 0 ? 'Começar →' : 'Continuar →'}
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Module list */}
      <div className="fade-up fade-up-1" style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
        {(modules as Module[]).map((mod, modIdx) => {
          const lessons = lessonsByModule.get(mod.id) ?? []
          const modCompleted = lessons.filter(l => progressMap.get(l.id)?.status === 'completed').length
          return (
            <div key={mod.id}>
              {/* Editorial chapter header */}
              <div style={{ marginBottom: 2 }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(52px, 8vw, 80px)',
                  fontWeight: 300,
                  lineHeight: 0.85,
                  color: 'var(--border-2)',
                  letterSpacing: '-0.04em',
                  marginBottom: 12,
                  userSelect: 'none',
                }}>
                  {String(modIdx + 1).padStart(2, '0')}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  paddingBottom: 14,
                  borderBottom: '1px solid var(--border)',
                  gap: 16,
                }}>
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(16px, 2.5vw, 20px)',
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    color: 'var(--text)',
                    lineHeight: 1.2,
                  }}>
                    {mod.name}
                  </span>
                  {lessons.length > 0 && (
                    <span style={{
                      fontSize: 11,
                      color: 'var(--text-dim)',
                      fontVariantNumeric: 'tabular-nums',
                      flexShrink: 0,
                    }}>
                      {modCompleted}/{lessons.length}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {lessons.map((lesson, lessonIdx) => {
                  const progress = progressMap.get(lesson.id)
                  return (
                    <LessonRow
                      key={lesson.id}
                      lesson={lesson}
                      progress={{
                        isCompleted: progress?.status === 'completed',
                        isInProgress: progress?.status === 'in_progress',
                      }}
                      canAccess={hasAccess || lesson.is_free}
                      productSlug={productSlug}
                      moduleSlug={mod.slug}
                      lessonNumber={lessonIdx + 1}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}

        {(modules ?? []).length === 0 && (
          <div style={{
            padding: '40px 24px',
            background: 'var(--bg-2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>Conteúdo em breve.</p>
          </div>
        )}
      </div>
    </div>
  )
}
