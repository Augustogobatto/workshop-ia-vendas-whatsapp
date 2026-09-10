import type { Metadata } from 'next'
import AulaPlayer from '../aula/AulaPlayer'
import Dobras, { Rodape } from '../aula/Dobras'
import config from '../aula/vsl-config.json'
import '../aula/aula.css'

/**
 * /aula-v2 — a MESMA VSL da /aula, com o pré-checkout no mensal.
 *
 * Rota separada por decisão do Augusto (10/09/2026): a /aula continua
 * exatamente como está, sem popup, e serve de controle do teste. Nada é
 * duplicado aqui — mesmo config, mesmo vídeo, mesmo CSS, mesmas dobras. A
 * única diferença é `preCheckout` e o carimbo de `pagina` na telemetria,
 * que é o que deixa os dois braços comparáveis do clique até a venda.
 *
 * Anual continua indo direto pro Payment Link da Stripe: o popup é só do
 * mensal (Fase 2 do plano `2026-09-10-pre-checkout-pix-plano`).
 *
 * `noindex` sempre: página de teste não entra no Google, e o Google não pode
 * escolher entre ela e a /aula como canônica.
 */

const PAGINA = '/aula-v2'

export const metadata: Metadata = {
  title: 'Push Club — uma pessoa, o trabalho de dez',
  description:
    'Eu não consulto a minha IA, eu contratei ela. As quatro peças que tiram a IA do chat e botam pra trabalhar dentro do seu negócio.',
  alternates: { canonical: 'https://ia.augustogobatto.com/aula' },
  robots: { index: false, follow: false },
}

export default function AulaV2Page() {
  return (
    <main className="au">
      <AulaPlayer config={config} pagina={PAGINA} />
      <Dobras preCheckout pagina={PAGINA} videoId={config.video_id} />
      <Rodape />
    </main>
  )
}
