'use server'

import { compraDoClubDoUsuario } from './_dados'
import { criarSessaoPortal } from '@/lib/stripe'

const RETURN_URL = 'https://ia.augustogobatto.com/members/assinatura'

export type PortalResult = { ok: true; url: string } | { ok: false; error: string }

/**
 * Abre o portal de cobrança da Stripe do PRÓPRIO usuário logado.
 *
 * O botão não manda nada: nem customer, nem subscription, nem email. O customer
 * sai da sessão autenticada aqui no servidor. Aceitar um id vindo do formulário
 * deixaria qualquer membro ler a fatura de outro.
 */
export async function abrirPortalDeCobranca(): Promise<PortalResult> {
  const r = await compraDoClubDoUsuario()

  if (r.estado === 'sem-sessao') return { ok: false, error: 'Sessão expirada — faz login de novo.' }
  if (r.estado !== 'ok' || !r.compra.stripe_customer_id) {
    return { ok: false, error: 'Não achamos uma cobrança recorrente no teu nome. Fala com o suporte.' }
  }

  try {
    const url = await criarSessaoPortal(r.compra.stripe_customer_id, RETURN_URL)
    return { ok: true, url }
  } catch (e) {
    console.error('[assinatura] portal da Stripe falhou:', e)
    return { ok: false, error: 'Não consegui abrir o portal de cobrança agora. Tenta de novo em alguns minutos.' }
  }
}
