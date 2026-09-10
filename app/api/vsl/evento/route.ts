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
  'retencao',      // marco de 10% em 10% do vídeo (rotulo = 10..100)
  'pitch',         // cruzou o pitch: a página abriu
  'abriu_oferta',  // rolou até a dobra de planos
  'clicou_cta',    // clicou num botão de checkout (rotulo = mensal|anual)
  'clicou_whats',  // foi falar com a IA de vendas (rotulo = fechada|aberta)
  'fim',           // vídeo terminou
  'saiu',          // fechou/saiu: segundo = ponto máximo assistido,
                   // rotulo = "<segundos na página>s"
  /* ── pré-checkout (/aula-v2, Fase 2 do plano de 10/09/2026) ──
     São o que compara o braço do popup com o controle passo a passo. */
  'pre_checkout_abriu',    // clicou no mensal e o popup abriu
  'pre_checkout_telefone', // digitou um WhatsApp válido (salvo na hora)
  'pre_checkout_metodo',   // escolheu como pagar (rotulo = cartao|pix)
  'pre_checkout_dados',    // mandou nome + CPF + e-mail
  'pix_qr_exibido',        // o QR de Pix Automático apareceu na tela
  'pix_pago',              // o banco confirmou e a página redirecionou
  'pre_checkout_fechou',   // fechou sem converter (rotulo = esc|fundo|x)
  'ja_membro',             // o telefone/e-mail já tem assinatura ativa
])

/* Braços do teste. Fora dessa lista, a coluna fica nula em vez de guardar
   o que o navegador mandou — sendBeacon é público. */
const PAGINAS = new Set(['/aula', '/aula-v2'])
const VISITANTE_RE = /^v_[a-z0-9]{20}$/

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

  /* Geolocalização vem da própria Vercel, nos headers da requisição. Nenhum IP
     de visitante sai daqui pra serviço de terceiro só pra virar nome de cidade. */
  let cidadeCrua = req.headers.get('x-vercel-ip-city')
  try {
    if (cidadeCrua) cidadeCrua = decodeURIComponent(cidadeCrua)
  } catch {}
  const cidade = texto(cidadeCrua, 80)
  const regiao = texto(req.headers.get('x-vercel-ip-country-region'), 12)
  const pais = texto(req.headers.get('x-vercel-ip-country'), 4)

  const paginaCrua = texto(body.pagina, 40)
  const visitanteCru = texto(body.visitante_id, 40)

  const linha = {
    video_id: texto(body.video_id, 40) ?? 'club-trafego',
    pagina: paginaCrua && PAGINAS.has(paginaCrua) ? paginaCrua : null,
    visitante_id: visitanteCru && VISITANTE_RE.test(visitanteCru) ? visitanteCru : null,
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
    cidade,
    regiao,
    pais,
    /* o próprio Augusto se marca com /aula?eu=1; sem isso ele vira 40% do
       relatório dele mesmo */
    interno: body.interno === true,
  }

  try {
    const supabase = createClient(url, key, { auth: { persistSession: false } })
    await supabase.from('vsl_eventos').insert(linha)
  } catch {
    // engole: a página não pode quebrar por causa de métrica
  }

  return NextResponse.json({ ok: true })
}
