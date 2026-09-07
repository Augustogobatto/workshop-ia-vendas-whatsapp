import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHmac, randomUUID, timingSafeEqual } from 'crypto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// O aparelho é identificado por um cookie httpOnly emitido AQUI e assinado com
// VOTACAO_SECRET. O cliente não escolhe o id: quem forjar cookie sem assinatura
// válida ganha um id novo (e cai no teto de aparelhos por IP da função no banco).
const COOKIE = 'cv_dev'
const DIAS = 60

function ipDe(req: Request) {
  const xff = req.headers.get('x-forwarded-for') ?? ''
  const primeiro = xff.split(',')[0]?.trim()
  return primeiro || req.headers.get('x-real-ip') || req.headers.get('cf-connecting-ip') || ''
}

function assina(id: string, secret: string) {
  return createHmac('sha256', secret).update(id).digest('hex').slice(0, 24)
}

function cookieDe(req: Request) {
  const raw = req.headers.get('cookie') ?? ''
  for (const par of raw.split(';')) {
    const [k, ...v] = par.trim().split('=')
    if (k === COOKIE) return decodeURIComponent(v.join('='))
  }
  return ''
}

function deviceDe(req: Request, secret: string): { id: string; novo: boolean } {
  const atual = cookieDe(req)
  const m = /^([a-f0-9-]{36})\.([a-f0-9]{24})$/.exec(atual)
  if (m) {
    const esperado = Buffer.from(assina(m[1], secret))
    const dado = Buffer.from(m[2])
    if (esperado.length === dado.length && timingSafeEqual(esperado, dado)) return { id: m[1], novo: false }
  }
  return { id: randomUUID(), novo: true }
}

export async function POST(req: Request) {
  let body: { opcao?: string } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, erro: 'rede' }, { status: 400 })
  }

  const secret = process.env.VOTACAO_SECRET
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!secret || !url || !key) return NextResponse.json({ ok: false, erro: 'config' }, { status: 500 })

  const { id, novo } = deviceDe(req, secret)
  const supabase = createClient(url, key, { auth: { persistSession: false } })

  const { data, error } = await supabase.rpc('club_votar', {
    p_opcao: body.opcao ?? '',
    p_ip: ipDe(req),
    p_device: id,
    p_user_agent: req.headers.get('user-agent') ?? '',
  })

  const res = error || !data ? NextResponse.json({ ok: false, erro: 'rede' }, { status: 502 }) : NextResponse.json(data)

  if (novo || (data && data.ok)) {
    res.cookies.set(COOKIE, `${id}.${assina(id, secret)}`, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: DIAS * 24 * 60 * 60,
    })
  }
  return res
}
