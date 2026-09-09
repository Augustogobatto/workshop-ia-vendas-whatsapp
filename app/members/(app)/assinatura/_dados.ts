// Leitura da compra do Club do usuário LOGADO. Server-only.
//
// Duas travas, de propósito:
//  1. RLS — a policy de `purchases` já escopa o select ao lead do `auth.uid()`
//     (conferido em 09/09/2026: um select sem filtro, com o JWT de um membro,
//     devolve só a linha dele).
//  2. filtro explícito por `lead_id`, lido do próprio `leads` do usuário.
// Nenhum id vem do cliente. Se um dia a RLS regredir, o filtro ainda segura.

import { createClient } from '@/lib/supabase/server'

export const PRODUTO_CLUB = 'bcb8822d-0ffb-41bb-b6a4-8a6c0b838a23'

export interface CompraClub {
  status: string | null
  price_paid_cents: number | null
  currency: string | null
  is_recurring: boolean | null
  stripe_subscription_id: string | null
  stripe_customer_id: string | null
  starts_at: string | null
  cancelled_at: string | null
  refunded_at: string | null
}

export type ResultadoCompra =
  | { estado: 'sem-sessao' }
  | { estado: 'sem-cadastro' }
  | { estado: 'sem-compra' }
  | { estado: 'ok'; compra: CompraClub }

export async function compraDoClubDoUsuario(): Promise<ResultadoCompra> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { estado: 'sem-sessao' }

  const { data: lead } = await supabase.from('leads').select('id').maybeSingle()
  if (!lead?.id) return { estado: 'sem-cadastro' }

  const { data: compra } = await supabase
    .from('purchases')
    .select(
      'status, price_paid_cents, currency, is_recurring, stripe_subscription_id, stripe_customer_id, starts_at, cancelled_at, refunded_at',
    )
    .eq('lead_id', lead.id)
    .eq('product_id', PRODUTO_CLUB)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!compra) return { estado: 'sem-compra' }
  return { estado: 'ok', compra: compra as CompraClub }
}
