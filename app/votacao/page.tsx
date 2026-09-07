import type { Metadata } from 'next'
import { Suspense } from 'react'
import Votacao from './Votacao'

export const metadata: Metadata = {
  title: 'Devemos migrar pro WhatsApp? — Push Club',
  description:
    'Votação dos membros do Push Club: migrar o grupo pro WhatsApp ou manter no Telegram. Um voto por pessoa, até 10/09.',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://ia.augustogobatto.com/votacao' },
  openGraph: {
    title: 'Devemos migrar pro WhatsApp?',
    description: 'Votação dos membros do Push Club. Um voto por pessoa, até 10/09.',
    url: 'https://ia.augustogobatto.com/votacao',
    type: 'website',
  },
}

export default function VotacaoPage() {
  return (
    <Suspense fallback={null}>
      <Votacao />
    </Suspense>
  )
}
