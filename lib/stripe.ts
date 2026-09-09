// Stripe pela REST API, com fetch puro — sem SDK.
//
// Por que sem SDK: a página de assinatura usa três endpoints (ler a assinatura,
// listar faturas, abrir o portal). O SDK traria uma dependência nova, pinning de
// API version e ~1 MB de bundle server pra isso. fetch resolve, e o timeout fica
// explícito — o que importa aqui, porque a página NÃO pode pendurar se a Stripe
// demorar.
//
// ⚠️ Este arquivo é SÓ servidor. `STRIPE_SECRET_KEY` é live. Nunca importar de
// componente 'use client'. Nada daqui (customer id, subscription id) pode ser
// devolvido pro browser — o que a página manda pro cliente é sempre o resumo
// já mastigado.

const STRIPE_API = 'https://api.stripe.com/v1'
const TIMEOUT_MS = 10_000

export class StripeIndisponivel extends Error {}

function authHeader(): string {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new StripeIndisponivel('STRIPE_SECRET_KEY não configurada')
  return 'Basic ' + Buffer.from(`${key}:`).toString('base64')
}

async function stripeFetch<T>(path: string, form?: Record<string, string>): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${STRIPE_API}/${path}`, {
      method: form ? 'POST' : 'GET',
      headers: {
        Authorization: authHeader(),
        ...(form ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
      },
      body: form ? new URLSearchParams(form).toString() : undefined,
      cache: 'no-store',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch (e) {
    // timeout, DNS, rede
    throw new StripeIndisponivel(`falha de rede em ${path.split('?')[0]}: ${String(e)}`)
  }
  if (!res.ok) {
    const corpo = await res.text().catch(() => '')
    throw new StripeIndisponivel(`Stripe ${res.status} em ${path.split('?')[0]} — ${corpo.slice(0, 300)}`)
  }
  return res.json() as Promise<T>
}

// ── Tipos (só o que a página usa) ─────────────────────────────

export type StripeSubStatus =
  | 'active' | 'trialing' | 'past_due' | 'unpaid' | 'canceled'
  | 'incomplete' | 'incomplete_expired' | 'paused'

export interface StripeCard {
  brand: string | null
  last4: string | null
  exp_month: number | null
  exp_year: number | null
}

export interface StripeFatura {
  id: string
  status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void' | null
  total: number | null
  currency: string | null
  created: number | null
  hosted_invoice_url: string | null
  numero: string | null
}

export interface ResumoAssinatura {
  status: StripeSubStatus
  cancelaNoFimDoPeriodo: boolean
  /** epoch em segundos — fim do período atual (próxima cobrança, ou fim do acesso) */
  fimDoPeriodo: number | null
  canceladaEm: number | null
  comecouEm: number | null
  /** valor do plano de HOJE, em centavos — vem do price da Stripe, nunca do banco */
  valorCentavos: number | null
  moeda: string | null
  intervalo: 'day' | 'week' | 'month' | 'year' | null
  intervaloContagem: number | null
  cartao: StripeCard | null
  faturas: StripeFatura[]
  /** primeira fatura em aberto (inclui o boleto gerado e não pago) */
  faturaEmAberto: StripeFatura | null
}

// ── Respostas cruas ───────────────────────────────────────────

interface RawPaymentMethod { card?: { brand?: string; last4?: string; exp_month?: number; exp_year?: number } }
interface RawInvoice {
  id: string
  status?: StripeFatura['status']
  total?: number
  currency?: string
  created?: number
  hosted_invoice_url?: string | null
  number?: string | null
}
interface RawSubscription {
  status: StripeSubStatus
  cancel_at_period_end?: boolean
  current_period_end?: number
  canceled_at?: number | null
  ended_at?: number | null
  start_date?: number
  default_payment_method?: RawPaymentMethod | string | null
  items?: {
    data?: {
      current_period_end?: number
      price?: {
        unit_amount?: number | null
        currency?: string
        recurring?: { interval?: ResumoAssinatura['intervalo']; interval_count?: number }
      }
    }[]
  }
}
interface RawCustomer { invoice_settings?: { default_payment_method?: RawPaymentMethod | string | null } }

function normalizaCartao(pm: RawPaymentMethod | string | null | undefined): StripeCard | null {
  if (!pm || typeof pm === 'string' || !pm.card) return null
  const c = pm.card
  return {
    brand: c.brand ?? null,
    last4: c.last4 ?? null,
    exp_month: c.exp_month ?? null,
    exp_year: c.exp_year ?? null,
  }
}

/**
 * Estado REAL da assinatura, direto da Stripe. Nada aqui olha o banco:
 * `purchases.status` já ficou 'active' com assinatura cancelada na Stripe
 * (auditoria de 16/08/2026), então a Stripe é a fonte da verdade.
 */
export async function buscarAssinatura(
  subscriptionId: string,
  customerId: string | null,
): Promise<ResumoAssinatura> {
  const qs = new URLSearchParams()
  qs.append('expand[]', 'items.data.price')
  qs.append('expand[]', 'default_payment_method')
  const sub = await stripeFetch<RawSubscription>(`subscriptions/${subscriptionId}?${qs}`)

  const item = sub.items?.data?.[0]
  const price = item?.price
  const rec = price?.recurring

  let cartao = normalizaCartao(sub.default_payment_method)
  if (!cartao && customerId) {
    // assinatura sem método próprio (caso do 'incomplete'): tenta o do cliente
    try {
      const cq = new URLSearchParams()
      cq.append('expand[]', 'invoice_settings.default_payment_method')
      const cust = await stripeFetch<RawCustomer>(`customers/${customerId}?${cq}`)
      cartao = normalizaCartao(cust.invoice_settings?.default_payment_method)
    } catch {
      cartao = null // sem cartão a página só omite o bloco
    }
  }

  const lista = await stripeFetch<{ data?: RawInvoice[] }>(
    `invoices?subscription=${encodeURIComponent(subscriptionId)}&limit=6`,
  )
  const faturas: StripeFatura[] = (lista.data ?? []).map((i) => ({
    id: i.id,
    status: i.status ?? null,
    total: i.total ?? null,
    currency: i.currency ?? null,
    created: i.created ?? null,
    hosted_invoice_url: i.hosted_invoice_url ?? null,
    numero: i.number ?? null,
  }))

  return {
    status: sub.status,
    cancelaNoFimDoPeriodo: Boolean(sub.cancel_at_period_end),
    fimDoPeriodo: sub.current_period_end ?? item?.current_period_end ?? null,
    canceladaEm: sub.canceled_at ?? sub.ended_at ?? null,
    comecouEm: sub.start_date ?? null,
    valorCentavos: price?.unit_amount ?? null,
    moeda: price?.currency ?? null,
    intervalo: rec?.interval ?? null,
    intervaloContagem: rec?.interval_count ?? null,
    cartao,
    faturas,
    faturaEmAberto: faturas.find((f) => f.status === 'open') ?? null,
  }
}

/** Sessão do portal de cobrança. A configuração default da conta já tem
 *  histórico de faturas, troca de cartão e cancelamento habilitados. */
export async function criarSessaoPortal(customerId: string, returnUrl: string): Promise<string> {
  const s = await stripeFetch<{ url?: string }>('billing_portal/sessions', {
    customer: customerId,
    return_url: returnUrl,
  })
  if (!s.url) throw new StripeIndisponivel('portal sem url')
  return s.url
}
