import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function ipDe(req: Request) {
  const xff = req.headers.get('x-forwarded-for') ?? ''
  const primeiro = xff.split(',')[0]?.trim()
  return primeiro || req.headers.get('x-real-ip') || req.headers.get('cf-connecting-ip') || ''
}

export async function POST(req: Request) {
  let body: { opcao?: string; device?: string } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, erro: 'rede' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  )

  const { data, error } = await supabase.rpc('club_votar', {
    p_opcao: body.opcao ?? '',
    p_ip: ipDe(req),
    p_device: body.device ?? '',
    p_user_agent: req.headers.get('user-agent') ?? '',
  })

  if (error || !data) return NextResponse.json({ ok: false, erro: 'rede' }, { status: 502 })
  return NextResponse.json(data)
}
