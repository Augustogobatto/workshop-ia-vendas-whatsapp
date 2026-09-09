/**
 * Base do serviço de CAPI na VPS (webhook do Stripe → Conversions API).
 *
 * PLACEHOLDER: trocar pela URL real quando o serviço subir. Enquanto for o
 * placeholder, a /aula/obrigado não consegue ler valor/plano da sessão e
 * dispara o Purchase sem `value` — o `eventID` (session_id) continua igual,
 * então a deduplicação com o evento do servidor não quebra.
 *
 * Contrato do endpoint lido pela página de obrigado:
 *   GET ${CAPI_BASE}/stripe-capi/sessao?id=<checkout_session_id>
 *   → { ok: boolean, plano: string, valor: number, moeda: string, event_id: string }
 */
export const CAPI_BASE = 'https://app.comentaeuquero.com'
