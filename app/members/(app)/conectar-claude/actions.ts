'use server'

import { randomBytes, createHash } from 'node:crypto'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

const MCP_URL = 'https://ia.augustogobatto.com/api/mcp/mcp'

export type GenerateResult =
  | { ok: true; url: string }
  | { ok: false; error: string }

export async function generateMcpToken(): Promise<GenerateResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Sessão expirada — faz login de novo.' }

  const service = createServiceClient()
  const { data: lead } = await service
    .from('leads')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()
  if (!lead) return { ok: false, error: 'Cadastro não encontrado.' }

  const { data: active } = await service.rpc('is_club_active', { p_lead_id: lead.id })
  if (!active) {
    return { ok: false, error: 'O conector é exclusivo para assinantes ativos do Club.' }
  }

  const token = 'club_' + randomBytes(20).toString('hex')
  const hash = createHash('sha256').update(token).digest('hex')

  // regenerar = revoga os anteriores
  await service
    .from('mcp_tokens')
    .update({ revoked_at: new Date().toISOString() })
    .eq('lead_id', lead.id)
    .is('revoked_at', null)

  const { error } = await service.from('mcp_tokens').insert({ lead_id: lead.id, token_hash: hash })
  if (error) return { ok: false, error: 'Erro ao gerar token. Tenta de novo.' }

  return { ok: true, url: `${MCP_URL}?key=${token}` }
}
