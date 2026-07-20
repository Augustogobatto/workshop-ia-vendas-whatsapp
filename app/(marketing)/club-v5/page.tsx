import type { Metadata } from 'next'
import HalideHero from './hero'

export const metadata: Metadata = {
  title: 'Push Club — IA · Business · Life',
  description:
    'Uma empresa onde só trabalha uma pessoa + IA — e você vendo tudo por dentro. Encontro ao vivo todo mês, todos os workshops, Claudinei 24/7 no Telegram. R$70/mês, sem fidelidade.',
}

export default function ClubV5Page() {
  return <HalideHero />
}
