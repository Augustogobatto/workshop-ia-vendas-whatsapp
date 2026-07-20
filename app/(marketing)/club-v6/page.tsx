import type { Metadata } from 'next'
import Wake from './wake'

export const metadata: Metadata = {
  title: 'Push Club',
  description: 'Uma empresa onde só trabalha uma pessoa + IA. Entra aí.',
  robots: { index: false }, // experimento — não indexar por enquanto
}

export default function ClubV6Page() {
  return <Wake />
}
