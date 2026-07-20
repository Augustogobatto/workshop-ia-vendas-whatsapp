import type { Metadata } from 'next'
import { headers } from 'next/headers'
import PassoClient from './_client'

export const metadata: Metadata = {
  title: 'Seu passo a passo — Push Club',
  description: 'O tutorial do relatório automático no WhatsApp. Grátis.',
  robots: { index: false },
}

export const dynamic = 'force-dynamic'

export default function PassoPage() {
  const h = headers()
  const rawCity = h.get('x-vercel-ip-city') ?? ''
  let city = ''
  try {
    city = decodeURIComponent(rawCity)
  } catch {
    city = rawCity
  }
  const region = h.get('x-vercel-ip-country-region') ?? ''
  const country = h.get('x-vercel-ip-country') ?? ''

  return <PassoClient city={city} region={region} country={country} />
}
