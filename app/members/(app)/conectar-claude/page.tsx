export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { ConnectPanel } from './_connect-panel'

export default async function ConectarClaudePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const service = createServiceClient()
  const { data: lead } = await service
    .from('leads')
    .select('id')
    .eq('auth_user_id', user!.id)
    .single()

  let clubActive = false
  let existingToken: { created_at: string; last_used_at: string | null } | null = null

  if (lead) {
    const { data: active } = await service.rpc('is_club_active', { p_lead_id: lead.id })
    clubActive = !!active
    const { data: tok } = await service
      .from('mcp_tokens')
      .select('created_at, last_used_at')
      .eq('lead_id', lead.id)
      .is('revoked_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    existingToken = tok ?? null
  }

  return (
    <div className="page-wrap" style={{ maxWidth: 720 }}>
      <div className="fade-up" style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 24,
            fontWeight: 700,
            color: 'var(--text)',
            marginBottom: 8,
          }}
        >
          Conectar seu Claude
        </h1>
        <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Conecte o Claude (Desktop ou claude.ai) direto ao conhecimento do Club: todas as aulas,
          workshops e o método do Gobatto. Seu Claude passa a responder citando as aulas — é o
          suporte infinito, dentro da ferramenta que você já usa.
        </p>
      </div>

      <div className="fade-up fade-up-1">
        <ConnectPanel clubActive={clubActive} existingToken={existingToken} />
      </div>

      <div className="fade-up fade-up-2" style={{ marginTop: 28, fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.6 }}>
        O uso do conector é registrado (pergunta e horário) pra gente melhorar o conteúdo do Club.
        O token é pessoal — não compartilhe. Se vazar, é só gerar outro que o antigo morre na hora.
      </div>
    </div>
  )
}
