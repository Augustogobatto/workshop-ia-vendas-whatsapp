import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Telemetria da VSL de tráfego (/aula).
 *
 * Chamada por navigator.sendBeacon, então: responde sempre 200 e nunca
 * devolve corpo que o cliente precise ler. Se o banco cair, a VSL continua
 * tocando — telemetria não pode derrubar página de venda.
 *
 * O cliente não escolhe o que quiser: EVENTOS é uma lista fechada e os
 * números são truncados. sendBeacon é público, então tudo aqui é
 * "dado de audiência", nunca autoridade pra nada.
 */
const EVENTOS = new Set([
  'carregou',      // página montou, vídeo mudo em loop
  'tocou_som',     // o visitante ligou o som (início real do assistir)
  'retomou',       // voltou e clicou "continuar de onde parei"
  'reiniciou',     // voltou e clicou "assistir do início"
  'quartil',       // 25/50/75 do vídeo (segundo diz qual)
  'pitch',         // cruzou o pitch: a página abriu
  'abriu_oferta',  // rolou até a dobra de planos
  'clicou_cta',    // clicou num botão de checkout (rotulo = mensal|anual)
  'clicou_whats',  // foi falar com a IA de vendas (rotulo = fechada|aberta)
  'fim',           // vídeo terminou
])

function texto(v: unknown, max: number) {
  return typeof v === 'string' ? v.slice(0, max) : null
}

function inteiro(v: unknown, max: number) {
  const n = typeof v === 'number' ? Math.trunc(v) : NaN
  if (!Number.isFinite(n) || n < 0) return null
  return Math.min(n, max)
}

export async function POST(req: Request) {
  let body: Record<string, unknown> = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: true })
  }

  const evento = texto(body.evento, 24)
  if (!evento || !EVENTOS.has(evento)) return NextResponse.json({ ok: true })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return NextResponse.json({ ok: true })

  const xff = req.headers.get('x-forwarded-for') ?? ''
  const ip = (xff.split(',')[0] ?? '').trim() || req.headers.get('x-real-ip') || null

  const linha = {
    video_id: texto(body.video_id, 40) ?? 'club-trafego',
    versao_id: inteiro(body.versao_id, 100000),
    sessao: texto(body.sessao, 40),
    evento,
    segundo: inteiro(body.segundo, 86400),
    rotulo: texto(body.rotulo, 40),
    headline_id: inteiro(body.headline_id, 100000),
    overlay_id: inteiro(body.overlay_id, 100000),
    thumb_id: inteiro(body.thumb_id, 100000),
    utm: texto(body.utm, 500),
    referer: texto(req.headers.get('referer'), 300),
    ua: texto(req.headers.get('user-agent'), 300),
    ip,
  }

  try {
    const supabase = createClient(url, key, { auth: { persistSession: false } })
    await supabase.from('vsl_eventos').insert(linha)
  } catch {
    // engole: a página não pode quebrar por causa de métrica
  }

  return NextResponse.json({ ok: true })
}
