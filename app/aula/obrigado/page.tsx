import type { Metadata } from 'next'
import Obrigado from './Obrigado'
import '../aula.css'

/**
 * /aula/obrigado — destino do Payment Link do Stripe depois da compra:
 *   https://ia.augustogobatto.com/aula/obrigado?session_id={CHECKOUT_SESSION_ID}
 *
 * O que ela faz está em `Obrigado.tsx` (Purchase no pixel com eventID =
 * session_id, deduplicado com o servidor). Aqui só a moldura: mesmo mundo
 * da /aula, sem preço, sem escassez, sem WhatsApp. Fora do índice sempre.
 */
export const metadata: Metadata = {
  title: 'Pronto — Push Club',
  robots: { index: false, follow: false },
}

export default function ObrigadoPage() {
  return (
    <main className="au">
      <Obrigado />
    </main>
  )
}
