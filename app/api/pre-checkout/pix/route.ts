import { NextResponse } from 'next/server'
import { createServiceClient } from '../../../../lib/supabase/service'
import { jaEMembro } from '../../../../lib/membro'
import { cpfDigitos, cpfValido, emailValido, telE164 } from '../../../../lib/br'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Ponte entre o popup e o `club-pagamentos` (vps-claude, porta 8798).
 *
 * O navegador NUNCA fala com o backend do Asaas: a rota `/pix/autorizacao` é
 * protegida por `x-club-token` e não tem CORS de propósito. O token mora só
 * na env da Vercel — nunca no repo, nunca no bundle do cliente.
 *
 * Três travas antes de criar cobrança:
 *  1. **Já é membro** (telefone/e-mail → `purchases` ativa do Club). O upsert
 *     de `purchases` do handler de acesso reescreveria a linha de um membro
 *     Stripe que pagasse por Pix. Achado da Fase 1.
 *  2. **Teto de 3 autorizações por telefone por dia.** O reuso do QR já é do
 *     backend (mesmo visitante, QR não vencido, mesma autorização); isto aqui
 *     é a trava contra quem troca de visitante_id pra criar cliente atrás de
 *     cliente no Asaas.
 *  3. Validação de CPF com dígito verificador antes de gastar a chamada.
 */

const VISITANTE_RE = /^v_[a-z0-9]{20}$/
const TETO_POR_TELEFONE_DIA = 3

function texto(v: unknown, max: number) {
  if (typeof v !== 'string') return null
  const t = v.trim()
  return t ? t.slice(0, max) : null
}

function erro(mensagem: string, status: number) {
  return NextResponse.json({ ok: false, erro: mensagem }, { status })
}

export async function POST(req: Request) {
  let body: Record<string, unknown> = {}
  try {
    body = await req.json()
  } catch {
    return erro('Não entendi os dados enviados. Tenta de novo.', 400)
  }

  const visitante_id = texto(body.visitante_id, 40)
  if (!visitante_id || !VISITANTE_RE.test(visitante_id)) {
    return erro('Sessão inválida. Recarrega a página e tenta de novo.', 400)
  }

  const telefone = telE164(texto(body.telefone, 40) || '')
  if (!telefone) return erro('Telefone inválido: use DDD + número (ex.: 54 98119-0099).', 400)

  const nome = texto(body.nome, 120)
  if (!nome || nome.length < 3 || !nome.includes(' ')) {
    return erro('Escreve o nome completo, como está no seu CPF.', 400)
  }

  const cpf = cpfDigitos(texto(body.cpf, 20) || '')
  if (!cpfValido(cpf)) return erro('CPF inválido: confere os números.', 400)

  const email = (texto(body.email, 160) || '').toLowerCase()
  if (!emailValido(email)) return erro('E-mail inválido: confere o endereço.', 400)

  const base = process.env.CLUB_PAGAMENTOS_URL
  const token = process.env.CLUB_PAGAMENTOS_TOKEN
  if (!base || !token) {
    console.error('[pre-checkout/pix] CLUB_PAGAMENTOS_URL/TOKEN não configurados')
    return erro('O Pix está fora do ar agora. Escolhe cartão ou tenta em alguns minutos.', 503)
  }

  if (await jaEMembro({ telefone, email })) {
    return NextResponse.json({ ok: true, membro: true })
  }

  /* Teto por telefone: conta as autorizações já criadas nas últimas 24 h. */
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const db = createServiceClient()
      const desde = new Date(Date.now() - 24 * 3600 * 1000).toISOString()
      const { data } = await db
        .from('pre_checkout')
        .select('visitante_id')
        .eq('telefone', telefone)
        .not('asaas_authorization_id', 'is', null)
        .gte('atualizado_em', desde)
        .limit(TETO_POR_TELEFONE_DIA + 1)
      const outros = (data || []).filter((l) => l.visitante_id !== visitante_id)
      if (outros.length >= TETO_POR_TELEFONE_DIA) {
        return erro(
          'Você já gerou vários códigos hoje com esse número. Paga um deles ou tenta amanhã.',
          429
        )
      }
    }
  } catch (e) {
    console.error('[pre-checkout/pix] contagem de teto falhou (seguindo):', e)
  }

  const corpo = {
    visitante_id,
    telefone,
    nome,
    cpf,
    email,
    sck: texto(body.sck, 200) || undefined,
    versao_id: typeof body.versao_id === 'number' ? Math.trunc(body.versao_id) : undefined,
    pagina: texto(body.pagina, 40) || undefined,
  }

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 20000)
  try {
    const r = await fetch(`${base.replace(/\/+$/, '')}/pix/autorizacao`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-club-token': token },
      body: JSON.stringify(corpo),
      signal: ctrl.signal,
      cache: 'no-store',
    })
    const dados = (await r.json().catch(() => ({}))) as Record<string, unknown>

    if (!r.ok) {
      const msg = texto(dados.erro, 200) || texto(dados.error, 200)
      console.error('[pre-checkout/pix] backend recusou', r.status, msg)
      if (r.status === 400 && msg) return erro(msg, 400)
      return erro('Não consegui gerar o código agora. Tenta de novo ou escolhe cartão.', 502)
    }

    return NextResponse.json({
      ok: true,
      membro: false,
      authorization_id: dados.authorization_id,
      payload: dados.payload,
      encodedImage: dados.encodedImage,
      expira_em: dados.expira_em,
      reusada: dados.reusada === true,
    })
  } catch (e) {
    console.error('[pre-checkout/pix] chamada ao backend explodiu:', e)
    return erro('O Pix demorou pra responder. Tenta de novo ou escolhe cartão.', 502)
  } finally {
    clearTimeout(timer)
  }
}
