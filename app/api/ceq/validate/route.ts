import { NextResponse } from 'next/server'
import { createHash } from 'node:crypto'
import { createServiceClient } from '@/lib/supabase/service'

// Ativação do comenta EU QUERO (CEQ): a instância do membro manda o token club_
// (o mesmo do "Conectar seu Claude") e a gente responde se a assinatura está ativa.
// Modo aviso: a ferramenta nunca é bloqueada por aqui — só informada.
//
// A instância também se identifica (produto, versão e um id aleatório criado no
// primeiro boot dela). Sem isso não dava pra separar quem roda o CEQ de quem está
// só usando o MCP no Claude, porque o token é o mesmo nos dois casos.
export async function POST(req: Request) {
  try {
    const { token, produto, versao, instancia } = await req.json()
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

    // Registro da instalação. Best-effort de propósito: se falhar, a ativação segue
    // normal — contar instância não pode ser motivo pra alguém ficar sem resposta.
    if (typeof instancia === 'string' && instancia.length >= 8) {
      const agora = new Date().toISOString()
      try {
        const { data: ja } = await sb
          .from('ceq_instancias')
          .select('pings')
          .eq('instancia_id', instancia)
          .maybeSingle()
        await sb.from('ceq_instancias').upsert({
          instancia_id: instancia,
          lead_id: tok.lead_id,
          produto: typeof produto === 'string' ? produto.slice(0, 20) : 'ceq',
          versao: typeof versao === 'string' ? versao.slice(0, 20) : '',
          ultimo_ping: agora,
          pings: (ja?.pings ?? 0) + 1,
          ...(ja ? {} : { primeiro_ping: agora }),
        })
      } catch {
        // silêncio proposital
      }
    }

    return NextResponse.json({ active: true, member: lead?.first_name ?? lead?.name ?? null })
  } catch {
    return NextResponse.json({ active: false, reason: 'erro' })
  }
}
