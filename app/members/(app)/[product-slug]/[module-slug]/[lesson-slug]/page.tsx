'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import DOMPurify from 'dompurify'
import { createClient } from '@/lib/supabase/client'
import type { LessonContent, Module, Lesson, LessonProgress } from '@/lib/supabase/types'
import { formatDuration } from '@/lib/utils'

interface PageProps {
  params: Promise<{
    'product-slug': string
    'module-slug': string
    'lesson-slug': string
  }>
}

interface OutlineLesson extends Lesson {
  progress?: LessonProgress
  moduleSlug: string
}

export default function LessonPage({ params }: PageProps) {
  const [slugs, setSlugs] = useState<{
    productSlug: string
    moduleSlug: string
    lessonSlug: string
  } | null>(null)

  const [lesson, setLesson] = useState<LessonContent | null>(null)
  const [outline, setOutline] = useState<{ module: Module; lessons: OutlineLesson[] }[]>([])
  const [leadId, setLeadId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [markingDone, setMarkingDone] = useState(false)
  const [isDone, setIsDone] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    params.then((p) =>
      setSlugs({
        productSlug: p['product-slug'],
        moduleSlug: p['module-slug'],
        lessonSlug: p['lesson-slug'],
      })
    )
  }, [params])

  const loadData = useCallback(async () => {
    if (!slugs) return
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/members/login'); return }

      // Get lesson content via RPC
      const { data: lessonData } = await supabase.rpc('get_lesson', {
        p_lesson_slug: slugs.lessonSlug,
        p_module_slug: slugs.moduleSlug,
        p_product_slug: slugs.productSlug,
      })

      if (!lessonData || lessonData.length === 0) {
        setError('Você não tem acesso a esta aula ou ela não existe.')
        setLoading(false)
        return
      }
      setLesson(lessonData[0] as LessonContent)

      // Get lead
      const { data: lead } = await supabase.from('leads').select('id').single()
      if (lead) setLeadId(lead.id)

      // Get product id
      const { data: product } = await supabase
        .from('products')
        .select('id')
        .eq('slug', slugs.productSlug)
        .single()

      if (!product) { setLoading(false); return }

      // Get modules + lessons for outline
      const { data: modules = [] } = await supabase
        .from('modules')
        .select('id, name, slug, sort_order, product_id, description, is_published')
        .eq('product_id', product.id)
        .eq('is_published', true)
        .order('sort_order')

      const moduleIds = (modules ?? []).map((m: Module) => m.id)
      const { data: allLessons = [] } = moduleIds.length
        ? await supabase
            .from('lessons')
            .select('id, module_id, name, slug, sort_order, content_type, duration_seconds, is_free, description, is_published, content_url, content_body')
            .in('module_id', moduleIds)
            .eq('is_published', true)
            .order('sort_order')
        : { data: [] }

      // Progress
      const { data: progressRows = [] } = lead
        ? await supabase
            .from('lesson_progress')
            .select('lesson_id, status, completed_at, progress_pct')
            .eq('lead_id', lead.id)
        : { data: [] }

      const progressMap = new Map(
        (progressRows ?? []).map((p: LessonProgress) => [p.lesson_id, p])
      )

      // Check if current lesson is done
      const currentLesson = (allLessons ?? []).find(
        (l: Lesson) => l.slug === slugs.lessonSlug
      ) as Lesson | undefined
      if (currentLesson) {
        setIsDone(progressMap.get(currentLesson.id)?.status === 'completed')
      }

      // Build outline
      const outlineModules = (modules as Module[]).map((mod) => ({
        module: mod,
        lessons: (allLessons as Lesson[])
          .filter((l) => l.module_id === mod.id)
          .map((l) => ({
            ...l,
            progress: progressMap.get(l.id),
            moduleSlug: mod.slug,
          })),
      }))
      setOutline(outlineModules)
    } finally {
      setLoading(false)
    }
  }, [slugs, supabase, router])

  useEffect(() => { loadData() }, [loadData])

  async function markComplete() {
    if (!leadId || !lesson || isDone) return
    setMarkingDone(true)
    try {
      const { data: lessonRow } = await supabase
        .from('lessons')
        .select('id')
        .eq('slug', lesson.lesson_slug)
        .single()

      if (!lessonRow) return

      await supabase.from('lesson_progress').upsert(
        {
          lead_id: leadId,
          lesson_id: lessonRow.id,
          status: 'completed',
          completed_at: new Date().toISOString(),
          progress_pct: 100,
        },
        { onConflict: 'lead_id,lesson_id' }
      )
      setIsDone(true)
    } finally {
      setMarkingDone(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh', color: 'var(--text-muted)', fontSize: 13 }}>
        Carregando aula...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '40px 48px', maxWidth: 600 }}>
        <div
          style={{
            padding: '28px 24px',
            background: 'var(--bg-2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center',
          }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ margin: '0 auto 12px' }}>
            <circle cx="16" cy="16" r="14" stroke="var(--text-dim)" strokeWidth="1.5"/>
            <path d="M16 10v7M16 21v1" stroke="var(--text-dim)" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>{error}</p>
          <Link
            href={slugs ? `/members/${slugs.productSlug}` : '/members'}
            style={{
              display: 'inline-flex',
              padding: '8px 16px',
              background: 'var(--surface)',
              border: '1px solid var(--border-2)',
              borderRadius: 'var(--radius)',
              fontSize: 13,
              color: 'var(--text)',
              textDecoration: 'none',
            }}
          >
            ← Voltar ao workshop
          </Link>
        </div>
      </div>
    )
  }

  if (!lesson || !slugs) return null

  // Find prev/next lesson across all modules
  const allOutlineLessons = outline.flatMap((m) => m.lessons)
  const currentIdx = allOutlineLessons.findIndex((l) => l.slug === slugs.lessonSlug)
  const prevLesson = currentIdx > 0 ? allOutlineLessons[currentIdx - 1] : null
  const nextLesson = currentIdx < allOutlineLessons.length - 1 ? allOutlineLessons[currentIdx + 1] : null

  return (
    <div style={{ display: 'flex', minHeight: '100dvh' }}>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

        {/* Header bar */}
        <div
          style={{
            padding: '0 32px',
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border)',
            background: 'var(--bg)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--text-muted)', minWidth: 0, overflow: 'hidden' }}>
            <Link href="/members" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>Dashboard</Link>
            <ChevronRight />
            <Link href={`/members/${slugs.productSlug}`} style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
              {lesson.product_name}
            </Link>
            <ChevronRight />
            <span style={{ color: 'var(--text-dim)', flexShrink: 0 }}>{lesson.module_name}</span>
            <ChevronRight />
            <span style={{ color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {lesson.lesson_name}
            </span>
          </div>
        </div>

        {/* Content area */}
        <div style={{ flex: 1, padding: '32px 40px 48px', overflowY: 'auto' }}>

          {/* Video / Embed */}
          {(lesson.content_type === 'video' || lesson.content_type === 'loom' || lesson.content_type === 'embed') && lesson.content_url && (
            <div
              style={{
                position: 'relative',
                paddingBottom: '56.25%',
                background: '#000',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                marginBottom: 32,
                border: '1px solid var(--border)',
              }}
            >
              <iframe
                src={lesson.content_url}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* PDF */}
          {lesson.content_type === 'pdf' && lesson.content_url && (
            <div style={{ marginBottom: 32 }}>
              <a
                href={lesson.content_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 16px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border-2)',
                  borderRadius: 'var(--radius)',
                  fontSize: 13.5,
                  color: 'var(--text)',
                  textDecoration: 'none',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 1.5h6l3 3v8a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-11A.5.5 0 0 1 2 1.5Z" stroke="currentColor" strokeWidth="1.2"/>
                </svg>
                Abrir PDF
              </a>
            </div>
          )}

          {/* Text / Markdown body */}
          {lesson.content_type === 'text' && lesson.content_body && (
            <div
              style={{
                maxWidth: '68ch',
                marginBottom: 32,
                lineHeight: 1.75,
                fontSize: 15,
                color: 'var(--text)',
              }}
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(lesson.content_body) }}
            />
          )}

          {/* Lesson meta */}
          <div style={{ maxWidth: '68ch' }}>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: '-0.01em',
                color: 'var(--text)',
                marginBottom: 6,
                lineHeight: 1.15,
              }}
            >
              {lesson.lesson_name}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              {lesson.duration_seconds && (
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {formatDuration(lesson.duration_seconds)}
                </span>
              )}
              {isDone && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--green)', fontWeight: 500 }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 6l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Concluída
                </span>
              )}
            </div>

            {/* Mark complete button */}
            {!isDone && (
              <button
                onClick={markComplete}
                disabled={markingDone}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '8px 16px',
                  marginBottom: 32,
                  background: 'var(--green)',
                  color: '#0A0A0A',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  cursor: markingDone ? 'wait' : 'pointer',
                  opacity: markingDone ? 0.7 : 1,
                  transition: 'opacity 0.15s',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M2 6.5l3 3 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {markingDone ? 'Salvando...' : 'Marcar como concluída'}
              </button>
            )}
          </div>

          {/* Prev / Next navigation */}
          <div
            style={{
              display: 'flex',
              gap: 10,
              paddingTop: 28,
              borderTop: '1px solid var(--border)',
              maxWidth: 600,
            }}
          >
            {prevLesson ? (
              <Link
                href={`/members/${slugs.productSlug}/${prevLesson.moduleSlug}/${prevLesson.slug}`}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 16px',
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  fontSize: 12.5,
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  transition: 'border-color 0.15s, color 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--text)' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2, color: 'var(--text-dim)' }}>Anterior</div>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'inherit' }}>{prevLesson.name}</div>
                </div>
              </Link>
            ) : <div style={{ flex: 1 }} />}

            {nextLesson ? (
              <Link
                href={`/members/${slugs.productSlug}/${nextLesson.moduleSlug}/${nextLesson.slug}`}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 8,
                  padding: '12px 16px',
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  fontSize: 12.5,
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  textAlign: 'right',
                  transition: 'border-color 0.15s, color 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--text)' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2, color: 'var(--text-dim)' }}>Próxima</div>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'inherit' }}>{nextLesson.name}</div>
                </div>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            ) : (
              <Link
                href={slugs ? `/members/${slugs.productSlug}` : '/members'}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 8,
                  padding: '12px 16px',
                  background: 'var(--green-10)',
                  border: '1px solid var(--green-20)',
                  borderRadius: 'var(--radius)',
                  fontSize: 12.5,
                  color: 'var(--green)',
                  textDecoration: 'none',
                  textAlign: 'right',
                }}
              >
                <div>
                  <div style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2, opacity: 0.7 }}>Fim do workshop</div>
                  <div>Ver certificado →</div>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Course outline sidebar */}
      <div
        style={{
          width: 260,
          flexShrink: 0,
          borderLeft: '1px solid var(--border)',
          background: 'var(--bg-2)',
          height: '100dvh',
          position: 'sticky',
          top: 0,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            padding: '14px 16px 10px',
            borderBottom: '1px solid var(--border)',
            flexShrink: 0,
          }}
        >
          <Link
            href={slugs ? `/members/${slugs.productSlug}` : '/members'}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M7.5 3L4.5 6l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {lesson.product_name}
          </Link>
        </div>

        <div style={{ flex: 1, padding: '8px 0' }}>
          {outline.map((section) => (
            <div key={section.module.id} style={{ marginBottom: 4 }}>
              <div
                style={{
                  padding: '6px 16px',
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--text-dim)',
                }}
              >
                {section.module.name}
              </div>
              {section.lessons.map((l) => {
                const isActive = l.slug === slugs?.lessonSlug
                const isComplete = l.progress?.status === 'completed'

                return (
                  <Link
                    key={l.id}
                    href={`/members/${slugs?.productSlug}/${l.moduleSlug}/${l.slug}`}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                      padding: '7px 16px',
                      background: isActive ? 'var(--surface)' : 'transparent',
                      textDecoration: 'none',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--bg-3)' }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                  >
                    <div style={{ flexShrink: 0, marginTop: 1 }}>
                      {isComplete ? (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <circle cx="6" cy="6" r="5" fill="var(--green-subtle)" stroke="var(--green)" strokeWidth="1.1"/>
                          <path d="M3.5 6l2 2 3-3" stroke="var(--green)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <circle cx="6" cy="6" r="5" stroke={isActive ? 'var(--border-2)' : 'var(--border)'} strokeWidth="1.1"/>
                        </svg>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: 12.5,
                        color: isActive
                          ? 'var(--text)'
                          : isComplete
                            ? 'var(--text-dim)'
                            : 'var(--text-muted)',
                        lineHeight: 1.4,
                        fontWeight: isActive ? 500 : 400,
                      }}
                    >
                      {l.name}
                    </span>
                  </Link>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ChevronRight() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ flexShrink: 0 }}>
      <path d="M3.5 2.5L6.5 5l-3 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
