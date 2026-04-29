'use client'

import Link from 'next/link'
import type { Lesson } from '@/lib/supabase/types'
import { formatDuration } from '@/lib/utils'

export function LessonRow({
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

  const inner = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 12px',
        borderRadius: 'var(--radius)',
        opacity: canAccess ? 1 : 0.5,
        transition: 'background 0.12s',
        cursor: canAccess ? 'pointer' : 'default',
      }}
    >
      <StatusIcon />
      <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-dim)', minWidth: 18, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
        {lessonNumber.toString().padStart(2, '0')}
      </span>
      <span style={{ flex: 1, fontSize: 13.5, color: isCompleted ? 'var(--text-muted)' : canAccess ? 'var(--text)' : 'var(--text-muted)', textDecoration: isCompleted ? 'line-through' : 'none', textDecorationColor: 'var(--text-dim)' }}>
        {lesson.name}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        {lesson.is_free && !canAccess && (
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--green)', background: 'var(--green-10)', padding: '2px 6px', borderRadius: 3 }}>
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

  if (!canAccess) return <div>{inner}</div>

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
      {inner}
    </Link>
  )
}

export function ContentTypeIcon({ type }: { type: Lesson['content_type'] }) {
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
