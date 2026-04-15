import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Module, Lesson, LessonProgress } from '@/lib/supabase/types'
import { formatDuration } from '@/lib/utils'

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
    <div style={{ padding: '40px 48px', maxWidth: 800 }}>

      {/* Breadcrumb */}
      <div className="fade-up" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, fontSize: 12.5, color: 'var(--text-muted)' }}>
          <Link href="/members" style={{ color: 'var(--text-muted)', transition: 'color 0.15s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            Dashboard
          </Link>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
            <path d="M4.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <span style={{ color: 'var(--text-dim)' }}>{product.name}</span>
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 26,
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

      {/* Module list */}
      <div className="fade-up fade-up-1" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {(modules ?? []).length === 0 ? (
          <div
            style={{
              padding: '40px 24px',
              background: 'var(--bg-2)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>
              As aulas serão publicadas em breve.
            </p>
          </div>
        ) : (
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

function LessonRow({
  lesson,
  progress,
  canAccess,
  productSlug,
  moduleSlug,
  lessonNumber,
}: {
  lesson: Lesson
  progress: { isCompleted: boolean; isInProgress: boolean }
  canAccess: boolean
  productSlug: string
  moduleSlug: string
  lessonNumber: number
}) {
  const { isCompleted, isInProgress } = progress

  const StatusIcon = () => {
    if (!canAccess) return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
        <rect x="2" y="5.5" width="10" height="7" rx="1.5" stroke="var(--text-dim)" strokeWidth="1.3"/>
        <path d="M4.5 5.5V4a2.5 2.5 0 0 1 5 0v1.5" stroke="var(--text-dim)" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    )
    if (isCompleted) return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
        <circle cx="7" cy="7" r="6" fill="var(--green-subtle)" stroke="var(--green)" strokeWidth="1.3"/>
        <path d="M4.5 7l2 2 3-3" stroke="var(--green)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
    if (isInProgress) return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
        <circle cx="7" cy="7" r="6" stroke="var(--green)" strokeWidth="1.3" strokeDasharray="2 1"/>
        <path d="M5.5 5.5 8.5 7l-3 1.5V5.5Z" fill="var(--green)"/>
      </svg>
    )
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
        <circle cx="7" cy="7" r="6" stroke="var(--border-2)" strokeWidth="1.3"/>
        <path d="M5.5 5.5 8.5 7l-3 1.5V5.5Z" stroke="var(--text-dim)" strokeWidth="1.2" strokeLinejoin="round"/>
      </svg>
    )
  }

  const content = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 12px',
        borderRadius: 'var(--radius)',
        opacity: canAccess ? 1 : 0.5,
        transition: 'background 0.12s',
        cursor: canAccess ? 'pointer' : 'default',
      }}
    >
      <StatusIcon />

      <span
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: 'var(--text-dim)',
          minWidth: 18,
          flexShrink: 0,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {lessonNumber.toString().padStart(2, '0')}
      </span>

      <span
        style={{
          flex: 1,
          fontSize: 13.5,
          color: isCompleted ? 'var(--text-muted)' : canAccess ? 'var(--text)' : 'var(--text-muted)',
          textDecoration: isCompleted ? 'line-through' : 'none',
          textDecorationColor: 'var(--text-dim)',
        }}
      >
        {lesson.name}
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        {lesson.is_free && !canAccess && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--green)',
              background: 'var(--green-10)',
              padding: '2px 6px',
              borderRadius: 3,
            }}
          >
            Grátis
          </span>
        )}
        {lesson.duration_seconds && (
          <span style={{ fontSize: 11.5, color: 'var(--text-dim)', fontVariantNumeric: 'tabular-nums' }}>
            {formatDuration(lesson.duration_seconds)}
          </span>
        )}
        <ContentTypeIcon type={lesson.content_type} />
      </div>
    </div>
  )

  if (!canAccess) return <div>{content}</div>

  return (
    <Link
      href={`/members/${productSlug}/${moduleSlug}/${lesson.slug}`}
      style={{ textDecoration: 'none' }}
      onMouseEnter={(e) => {
        const div = e.currentTarget.querySelector('div') as HTMLElement | null
        if (div) div.style.background = 'var(--surface)'
      }}
      onMouseLeave={(e) => {
        const div = e.currentTarget.querySelector('div') as HTMLElement | null
        if (div) div.style.background = 'transparent'
      }}
    >
      {content}
    </Link>
  )
}

function ContentTypeIcon({ type }: { type: Lesson['content_type'] }) {
  const icons: Record<string, React.ReactNode> = {
    video: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M1.5 3.5A1 1 0 0 1 2.5 2.5h7a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1v-5Z" stroke="var(--text-dim)" strokeWidth="1.1"/>
        <path d="M4.5 4.5 7.5 6l-3 1.5V4.5Z" fill="var(--text-dim)"/>
      </svg>
    ),
    loom: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <circle cx="6" cy="6" r="4.5" stroke="var(--text-dim)" strokeWidth="1.1"/>
        <path d="M4.5 4.5 7.5 6l-3 1.5V4.5Z" fill="var(--text-dim)"/>
      </svg>
    ),
    text: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2 3.5h8M2 6h6M2 8.5h7" stroke="var(--text-dim)" strokeWidth="1.1" strokeLinecap="round"/>
      </svg>
    ),
    pdf: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2 1.5h6l2 2v7a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-9A.5.5 0 0 1 2 1.5Z" stroke="var(--text-dim)" strokeWidth="1.1"/>
        <path d="M8 1.5V3.5h2" stroke="var(--text-dim)" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  }
  return <>{icons[type] ?? icons.video}</>
}
