import { createServiceClient } from './supabase/service'
import { telVariantes } from './br'

/**
 * "Essa pessoa já é membro?" — a checagem que tem que rodar ANTES de gerar
 * um QR de Pix.
 *
 * Por quê: o handler de acesso do `club-pagamentos` faz upsert em `purchases`
 * por (lead_id, product_id). Se um membro que já paga pela Stripe pagar de
 * novo por Pix, o upsert **reescreve a linha dele** — a assinatura da Stripe
 * continua cobrando e a página de assinatura passa a mostrar o Asaas. Achado
 * da Fase 1 (10/09/2026), registrado no PLANO.
 *
 * Então: telefone (com e sem o 9º dígito, com e sem `+`) OU e-mail em `leads`
 * → `purchases` do Club com `status='active'`. Se achou, o popup mostra
 * "você já é membro" e não cria autorização nenhuma.
 *
 * Falha de rede/banco devolve `false`: barrar quem quer comprar por causa de
 * uma consulta que não respondeu é pior que o risco que ela evita.
 */

export const PRODUTO_CLUB = 'bcb8822d-0ffb-41bb-b6a4-8a6c0b838a23'

export async function jaEMembro(opts: { telefone?: string | null; email?: string | null }): Promise<boolean> {
  const telefone = (opts.telefone || '').trim()
  const email = (opts.email || '').trim().toLowerCase()
  if (!telefone && !email) return false
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return false

  try {
    const db = createServiceClient()

    const ids = new Set<string>()

    if (telefone) {
      const formas = telVariantes(telefone)
      if (formas.length) {
        const { data } = await db.from('leads').select('id').in('phone', formas).limit(20)
        for (const l of data || []) if (l.id) ids.add(l.id as string)
      }
    }
    if (email) {
      const { data } = await db.from('leads').select('id').ilike('email', email).limit(20)
      for (const l of data || []) if (l.id) ids.add(l.id as string)
    }
    if (!ids.size) return false

    const { data: compras } = await db
      .from('purchases')
      .select('id')
      .in('lead_id', Array.from(ids))
      .eq('product_id', PRODUTO_CLUB)
      .eq('status', 'active')
      .limit(1)

    return !!(compras && compras.length)
  } catch {
    return false
  }
}
