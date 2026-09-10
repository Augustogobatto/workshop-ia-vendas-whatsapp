import type { Metadata } from 'next'
import Obrigado from './Obrigado'
import ObrigadoPix from './ObrigadoPix'
import '../aula.css'

/**
 * /aula/obrigado — destino depois da compra. Dois ramos:
 *
 *  - `?session_id=cs_…`  Stripe. `Obrigado.tsx` dispara o Purchase no pixel
 *    com `eventID = session_id`, deduplicado com a CAPI do servidor.
 *  - `?asaas=<uuid>`     Pix Automático. `ObrigadoPix.tsx` só confirma —
 *    **não dispara Purchase** (o porquê está lá dentro).
 *
 * Mesma moldura da /aula: sem preço, sem escassez, fora do índice sempre.
 */
export const metadata: Metadata = {
  title: 'Pronto — Push Club',
  robots: { index: false, follow: false },
}

const ASAAS_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function ObrigadoPage({
  searchParams,
}: {
  searchParams: Promise<{ asaas?: string; session_id?: string }>
}) {
  const sp = await searchParams
  const asaas = (sp.asaas || '').trim()

  return (
    <main className="au">
      {ASAAS_RE.test(asaas) ? <ObrigadoPix /> : <Obrigado />}
    </main>
  )
}
