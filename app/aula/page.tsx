import type { Metadata } from 'next'
import AulaPlayer from './AulaPlayer'
import Dobras, { Rodape } from './Dobras'
import config from './vsl-config.json'
import './aula.css'

/**
 * /aula — VSL de tráfego do Push Club.
 *
 * Desenho portado do funil "Protocolo Viral" (dossiê 2026-09-06): o vídeo é
 * a página; as dobras só existem depois que o visitante cruza o pitch com o
 * som ligado. A oferta e a estética são do Club.
 *
 * Enquanto `publicada` é false a página fica fora do índice — é a trava que
 * impede tráfego cair numa VSL com vídeo placeholder.
 */

const PUBLICADA = config.publicada

export const metadata: Metadata = {
  title: 'Push Club — uma pessoa, o trabalho de dez',
  description:
    'Eu não consulto a minha IA, eu contratei ela. As quatro peças que tiram a IA do chat e botam pra trabalhar dentro do seu negócio.',
  alternates: { canonical: 'https://ia.augustogobatto.com/aula' },
  robots: PUBLICADA ? undefined : { index: false, follow: false },
  openGraph: {
    type: 'website',
    url: 'https://ia.augustogobatto.com/aula',
    title: 'Push Club — uma pessoa, o trabalho de dez',
    description:
      'Eu não consulto a minha IA, eu contratei ela. As quatro peças que tiram a IA do chat e botam pra trabalhar dentro do seu negócio.',
    images: [{ url: '/club-v7/og.jpg', width: 1200, height: 630 }],
  },
}

export default function AulaPage() {
  return (
    <main className="au">
      <AulaPlayer config={config} />
      <Dobras />
      <Rodape />
    </main>
  )
}
