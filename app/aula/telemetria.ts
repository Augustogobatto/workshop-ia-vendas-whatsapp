/**
 * Transporte da telemetria da VSL — compartilhado pelo `AulaPlayer` e pelo
 * `PreCheckout`, que precisam mandar eventos da MESMA sessão e do MESMO
 * braço do teste (/aula × /aula-v2) sem um conhecer o estado do outro.
 *
 * As chaves de sessão e de variante são as que o player já grava no boot
 * (`vsl_sid_<video_id>` em sessionStorage, `vsl_ab_<video_id>` em
 * localStorage). O popup só existe depois do pitch, então quando ele lê,
 * as duas já estão gravadas.
 *
 * sendBeacon: não bloqueia, não espera resposta, e se falhar a página segue.
 * Métrica nunca derruba página de venda.
 */

export type PaginaVsl = '/aula' | '/aula-v2'

export const ROTA_EVENTO = '/api/vsl/evento'

export type CorpoEvento = {
  video_id: string
  versao_id: number | null
  sessao: string
  evento: string
  pagina: PaginaVsl
  visitante_id?: string
  segundo?: number
  rotulo?: string
  utm?: string
  interno?: boolean
}

export function chaveSessao(videoId: string) {
  return `vsl_sid_${videoId}`
}
export function chaveVariante(videoId: string) {
  return `vsl_ab_${videoId}`
}

/** Sessão e variante já sorteadas pelo player. Nunca cria nada: só lê. */
export function contextoVsl(videoId: string): { sessao: string; versao_id: number | null; interno: boolean } {
  let sessao = ''
  let versao_id: number | null = null
  let interno = false
  try {
    sessao = sessionStorage.getItem(chaveSessao(videoId)) || ''
  } catch {}
  try {
    const n = parseInt(localStorage.getItem(chaveVariante(videoId)) || '', 10)
    if (Number.isFinite(n)) versao_id = n
  } catch {}
  try {
    interno = localStorage.getItem('vsl_interno') === '1'
  } catch {}
  return { sessao, versao_id, interno }
}

export function enviarEvento(corpo: CorpoEvento) {
  try {
    const json = JSON.stringify(corpo)
    const blob = new Blob([json], { type: 'application/json' })
    if (typeof navigator.sendBeacon === 'function' && navigator.sendBeacon(ROTA_EVENTO, blob)) return
    fetch(ROTA_EVENTO, { method: 'POST', body: json, keepalive: true }).catch(() => {})
  } catch {}
}
