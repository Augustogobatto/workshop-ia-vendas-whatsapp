/**
 * Rastreio de visitante — contrato ÚNICO da /aula e da /club.
 *
 * O que vai pro Stripe: só o `visitante_id` (`client_reference_id`). Payment
 * Link aceita apenas [A-Za-z0-9_-] nesse campo e descarta em silêncio o que
 * não bate; o `sck` com `|` era descartado inteiro (0 de 62 compras com
 * referência em 08/09/2026). Por isso a atribuição (sck, UTMs, fbclid,
 * _fbp/_fbc) fica no servidor, em `rastreio_visitantes`, chaveada pelo id —
 * o webhook da VPS lê a compra com o id e recupera o resto da tabela.
 *
 * O `sck` continua sendo calculado e salvo em `club_primeiro_toque`, no MESMO
 * formato de sempre: outros lugares leem essa chave. Ele só deixou de ir pro
 * link do Stripe.
 *
 * Ressalva conhecida: a chave se chama "primeiro toque" mas é sobrescrita a
 * cada visita com UTM nova, então na prática é ÚLTIMO toque. O `primeiro_toque`
 * de verdade agora existe na tabela (só é gravado no insert).
 *
 * Tudo aqui é silencioso: métrica nunca derruba página de venda.
 */

export const SCK_KEY = 'club_primeiro_toque'
const SCK_MAXLEN = 120
const SCK_TTL = 2592e6 // 30 dias

export const VISITANTE_KEY = 'club_visitante'
const VISITANTE_RE = /^v_[a-z0-9]{20}$/

const ROTA_RASTREIO = '/api/rastreio'
const UTM_CHAVES = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const

export type PaginaRastreada = '/aula' | '/club'

function normSck(v: string | null) {
  return String(v || '').trim().replace(/\s+/g, '-').replace(/^\|+|\|+$/g, '')
}

/** UTM da URL → `sck` → localStorage. Sem UTM, devolve o salvo (30 dias). */
export function resolverSck(): string {
  let q: URLSearchParams
  try {
    q = new URLSearchParams(location.search)
  } catch {
    return ''
  }
  let sck = normSck(q.get('sck'))
  if (!sck) {
    sck = UTM_CHAVES.map((k) => normSck(q.get(k))).filter(Boolean).join('|')
  }
  sck = sck.slice(0, SCK_MAXLEN).replace(/\|+$/, '')
  try {
    if (sck) {
      localStorage.setItem(SCK_KEY, JSON.stringify({ v: sck, t: Date.now() }))
    } else {
      const salvo = JSON.parse(localStorage.getItem(SCK_KEY) || 'null')
      if (salvo && salvo.v && Date.now() - salvo.t < SCK_TTL) sck = salvo.v
    }
  } catch {}
  return sck
}

function gerarId(): string {
  const alfabeto = '0123456789abcdefghijklmnopqrstuvwxyz'
  let s = ''
  try {
    const bytes = new Uint8Array(20)
    crypto.getRandomValues(bytes)
    for (let i = 0; i < bytes.length; i++) s += alfabeto[bytes[i] % 36]
  } catch {
    while (s.length < 20) s += Math.floor(Math.random() * 36).toString(36)
  }
  return 'v_' + s
}

/**
 * `v_` + 20 chars base36, gerado no primeiro acesso e guardado sem expirar.
 * Se o localStorage estiver bloqueado, cada carregamento ganha um id novo —
 * o servidor recebe esse id na mesma visita, então a compra ainda casa.
 */
export function visitanteId(): string {
  try {
    const salvo = localStorage.getItem(VISITANTE_KEY)
    if (salvo && VISITANTE_RE.test(salvo)) return salvo
  } catch {}
  const id = gerarId()
  try {
    localStorage.setItem(VISITANTE_KEY, id)
  } catch {}
  return id
}

/** Carimba o link do Stripe com o id do visitante. Idempotente. */
export function carimbar(a: HTMLAnchorElement, visitante: string) {
  if (!visitante || !VISITANTE_RE.test(visitante)) return
  try {
    const u = new URL(a.href)
    u.searchParams.set('client_reference_id', visitante)
    a.href = u.toString()
  } catch {}
}

export function carimbarTodos(visitante: string) {
  try {
    document
      .querySelectorAll<HTMLAnchorElement>('a[href*="buy.stripe.com"]')
      .forEach((a) => carimbar(a, visitante))
  } catch {}
}

function cookie(nome: string): string {
  try {
    const m = document.cookie.match(new RegExp('(?:^|; )' + nome + '=([^;]*)'))
    return m ? decodeURIComponent(m[1]) : ''
  } catch {
    return ''
  }
}

/**
 * Manda a atribuição desta visita pro servidor. Só campos preenchidos: o
 * upsert só sobrescreve coluna que veio no corpo, então uma volta direta
 * (sem UTM) não apaga a origem gravada antes.
 */
export function enviarRastreio(pagina: PaginaRastreada, visitante: string, sck: string) {
  try {
    const corpo: Record<string, string> = { visitante_id: visitante, pagina }
    if (sck) corpo.sck = sck
    let q: URLSearchParams | null = null
    try {
      q = new URLSearchParams(location.search)
    } catch {}
    if (q) {
      for (const k of [...UTM_CHAVES, 'fbclid']) {
        const v = (q.get(k) || '').trim()
        if (v) corpo[k] = v
      }
    }
    /* cookies do fbevents.js — podem não existir (adblock, primeiro
       carregamento antes do script). Sem _fbc mas com fbclid, o servidor monta. */
    const fbp = cookie('_fbp')
    const fbc = cookie('_fbc')
    if (fbp) corpo.fbp = fbp
    if (fbc) corpo.fbc = fbc

    const json = JSON.stringify(corpo)
    const blob = new Blob([json], { type: 'application/json' })
    const foi =
      typeof navigator.sendBeacon === 'function' && navigator.sendBeacon(ROTA_RASTREIO, blob)
    if (!foi) {
      fetch(ROTA_RASTREIO, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: json,
        keepalive: true,
      }).catch(() => {})
    }
    return { fbp: !!fbp, fbc: !!fbc }
  } catch {
    return { fbp: false, fbc: false }
  }
}

/**
 * Boot do rastreio numa página de venda: resolve o sck, garante o id,
 * carimba todas as âncoras do Stripe e manda a visita pro servidor.
 *
 * O envio é um por carregamento. Se os cookies `_fbp`/`_fbc` ainda não
 * existiam (o pixel carrega depois da hidratação), reenvia UMA vez alguns
 * segundos depois só pra completar esses dois campos — é upsert, não dói.
 */
export function iniciarRastreio(pagina: PaginaRastreada) {
  const sck = resolverSck()
  const visitante = visitanteId()
  carimbarTodos(visitante)
  const primeiro = enviarRastreio(pagina, visitante, sck)

  let timer: number | null = null
  if (!primeiro.fbp || !primeiro.fbc) {
    timer = window.setTimeout(() => {
      timer = null
      const temFbp = !!cookie('_fbp')
      const temFbc = !!cookie('_fbc')
      if ((temFbp && !primeiro.fbp) || (temFbc && !primeiro.fbc)) {
        enviarRastreio(pagina, visitante, sck)
      }
    }, 3500)
  }

  return {
    visitante,
    sck,
    parar() {
      if (timer !== null) window.clearTimeout(timer)
    },
  }
}
