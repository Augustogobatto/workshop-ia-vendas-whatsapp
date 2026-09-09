import { NextResponse } from 'next/server'
import { createServiceClient } from '../../../lib/supabase/service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Atribuição por visitante das páginas de venda (/aula e /club).
 *
 * O cliente manda `visitante_id` (o mesmo que vai no `client_reference_id`
 * do Stripe) + sck/UTMs/fbclid/_fbp/_fbc. Aqui vira UPSERT em
 * `rastreio_visitantes`: `primeiro_toque` só no insert (default do banco),
 * `ultimo_toque` sempre. Só entra no corpo do upsert a coluna que VEIO
 * preenchida — o PostgREST só sobrescreve o que está no payload, então uma
 * volta sem UTM não apaga a origem gravada na primeira visita.
 *
 * Chamada por sendBeacon: responde sempre 200 e nunca devolve nada que o
 * cliente precise ler. Se o banco cair, a página de venda segue.
 * sendBeacon é público — isto é dado de audiência, nunca autoridade.
 */
const VISITANTE_RE = /^v_[a-z0-9]{20}$/
const PAGINAS = new Set(['/aula', '/club'])

/* [coluna, tamanho máximo] */
const CAMPOS: Array<[string, number]> = [
  ['sck', 200],
  ['utm_source', 120],
  ['utm_medium', 120],
  ['utm_campaign', 160],
  ['utm_content', 160],
  ['utm_term', 160],
  ['fbclid', 400],
  ['fbp', 80],
  ['fbc', 500],
]

function texto(v: unknown, max: number) {
  if (typeof v !== 'string') return null
  const t = v.trim()
  return t ? t.slice(0, max) : null
}

export async function POST(req: Request) {
  const ok = NextResponse.json({ ok: true })

  let body: Record<string, unknown> = {}
  try {
    body = await req.json()
  } catch {
    return ok
  }

  const visitante_id = texto(body.visitante_id, 40)
  if (!visitante_id || !VISITANTE_RE.test(visitante_id)) return ok

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return ok

  const linha: Record<string, string> = {
    visitante_id,
    ultimo_toque: new Date().toISOString(),
  }
  for (const [coluna, max] of CAMPOS) {
    const v = texto(body[coluna], max)
    if (v) linha[coluna] = v
  }
  /* sem cookie _fbc mas com fbclid na URL: o formato oficial da Meta é
     fb.1.<timestamp ms>.<fbclid> — montar aqui poupa o cliente */
  if (!linha.fbc && linha.fbclid) linha.fbc = `fb.1.${Date.now()}.${linha.fbclid}`

  const pagina = texto(body.pagina, 40)
  if (pagina && PAGINAS.has(pagina)) linha.pagina = pagina

  const ua = texto(req.headers.get('user-agent'), 300)
  if (ua) linha.user_agent = ua
  const xff = req.headers.get('x-forwarded-for') ?? ''
  const ip = (xff.split(',')[0] ?? '').trim() || req.headers.get('x-real-ip') || ''
  if (ip) linha.ip = ip.slice(0, 64)

  try {
    const supabase = createServiceClient()
    await supabase.from('rastreio_visitantes').upsert(linha, { onConflict: 'visitante_id' })
  } catch {
    // engole: a página não pode quebrar por causa de métrica
  }

  return ok
}
