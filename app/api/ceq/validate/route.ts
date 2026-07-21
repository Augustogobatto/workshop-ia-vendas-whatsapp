import { NextResponse } from 'next/server'
import { createHash } from 'node:crypto'
import { createServiceClient } from '@/lib/supabase/service'

// Ativação do comenta EU QUERO (CEQ): a instância do membro manda o token club_
// (o mesmo do "Conectar seu Claude") e a gente responde se a assinatura está ativa.
// Modo aviso: a ferramenta nunca é bloqueada por aqui — só informada.
export async function POST(req: Request) {
  try {
    const { token } = await req.json()
    if (!token || typeof token !== 'string' || !token.startsWith('club_')) {
      return NextResponse.json({ active: false, reason: 'token_invalido' })
    }
    const hash = createHash('sha256').update(token).digest('hex')
    const sb = createServiceClient()
    const { data: tok } = await sb
      .from('mcp_tokens')
      .select('id, lead_id')
      .eq('token_hash', hash)
      .is('revoked_at', null)
      .single()
    if (!tok) return NextResponse.json({ active: false, reason: 'token_nao_encontrado' })

    const { data: active } = await sb.rpc('is_club_active', { p_lead_id: tok.lead_id })
    if (!active) return NextResponse.json({ active: false, reason: 'assinatura_inativa' })

    const { data: lead } = await sb
      .from('leads')
      .select('first_name, name')
      .eq('id', tok.lead_id)
      .single()
    await sb.from('mcp_tokens').update({ last_used_at: new Date().toISOString() }).eq('id', tok.id)

    return NextResponse.json({ active: true, member: lead?.first_name ?? lead?.name ?? null })
  } catch {
    return NextResponse.json({ active: false, reason: 'erro' })
  }
}
