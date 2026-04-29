'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const WORKSHOP_DATE = new Date('2026-04-21T08:00:00-03:00')
const WORKSHOP_SLUG = 'workshop-ia-vendas-whatsapp'

function getTimeLeft() {
  const diff = WORKSHOP_DATE.getTime() - Date.now()
  if (diff <= 0) return null
  const days    = Math.floor(diff / 86400000)
  const hours   = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  return { days, hours, minutes }
}

export function DashboardBanner() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft)

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 60000)
    return () => clearInterval(id)
  }, [])

  if (timeLeft === null) return null

  const parts: string[] = []
  if (timeLeft.days > 0) parts.push(`${timeLeft.days} dia${timeLeft.days !== 1 ? 's' : ''}`)
  if (timeLeft.hours > 0) parts.push(`${timeLeft.hours} hora${timeLeft.hours !== 1 ? 's' : ''}`)
  if (timeLeft.days === 0 && timeLeft.minutes > 0) parts.push(`${timeLeft.minutes} minuto${timeLeft.minutes !== 1 ? 's' : ''}`)

  return (
    <div
      className="fade-up"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20,
        padding: '14px 20px',
        background: 'var(--green-subtle)',
        border: '1px solid var(--green-20)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: 36,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span
          className="pulse"
          style={{
            width: 7,
            height: 7,
            background: 'var(--green)',
            borderRadius: '50%',
            display: 'inline-block',
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: 13.5, color: 'var(--text)', lineHeight: 1.4 }}>
          <span style={{ fontWeight: 600, color: 'var(--green)' }}>Atenção —</span>
          {' '}Seu workshop de IA de Vendas no WhatsApp será em{' '}
          <span style={{ fontWeight: 600, color: 'var(--text)' }}>{parts.join(' e ')}</span>.
        </span>
      </div>

      <Link
        href={`/members/${WORKSHOP_SLUG}#checklist`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '7px 14px',
          background: 'var(--green)',
          color: '#0A0A0A',
          borderRadius: 'var(--radius)',
          fontSize: 12.5,
          fontWeight: 700,
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        Checklist pré-aula →
      </Link>
    </div>
  )
}
