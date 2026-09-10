import { NextResponse } from 'next/server'
import { createServiceClient } from '../../../lib/supabase/service'
import { jaEMembro } from '../../../lib/membro'
import { cpfDigitos, cpfValido, emailValido, telE164 } from '../../../lib/br'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * O que a pessoa digitou no popup da /aula-v2, salvo passo a passo.
 *
 * O telefone é gravado **assim que fica válido**, sem esperar ela avançar:
 * é o que permite a régua de recuperação da Fase 3 falar com quem parou no
 * meio. Cada passo seguinte só acrescenta campo — o upsert manda só o que
 * veio no corpo, então voltar um passo não apaga o que já estava lá.
 *
 * Responde **sempre 200** (métrica e formulário de venda não podem derrubar
 * a página), mas loga o erro. O corpo devolvido só carrega `{ok, membro}` —
 * nada de dado pessoal volta pro navegador.
 *
 * Service role só aqui dentro; o navegador nunca fala com o Supabase.
 */

const VISITANTE_RE = /^v_[a-z0-9]{20}$/
const PAGINAS = new Set(['/aula', '/aula-v2'])
const METODOS = new Set(['cartao', 'pix'])
/**
 * O estado só ANDA PRA FRENTE. A régua vale pros estados do popup e pros que
 * o `club-pagamentos` escreve sozinho.
 *
 * Não é preciosismo: o backend só reusa uma autorização de Pix se a linha
 * estiver em `qr_exibido`. Medido em 10/09/2026 — o popup mandou `dados` de
 * novo, rebaixou a linha, e o mesmo visitante ganhou uma SEGUNDA autorização
 * no Asaas (dois clientes, duas cobranças agendadas). Estado que anda pra
 * trás vira cobrança duplicada.
 */
const RANK: Record<string, number> = {
  abriu: 1,
  telefone: 2,
  metodo: 3,
  dados: 4,
  qr_exibido: 5,
  stripe_redirect: 6,
  expirado: 7,
  recusado: 7,
  ativo: 9,
  pago: 9,
}
/* o que o popup tem permissão de escrever */
const ESTADOS = new Set(['abriu', 'telefone', 'metodo', 'dados', 'qr_exibido', 'stripe_redirect'])

function texto(v: unknown, max: number) {
  if (typeof v !== 'string') return null
  const t = v.trim()
  return t ? t.slice(0, max) : null
}

export async function POST(req: Request) {
  let body: Record<string, unknown> = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: true, membro: false })
  }

  const visitante_id = texto(body.visitante_id, 40)
  if (!visitante_id || !VISITANTE_RE.test(visitante_id)) {
    return NextResponse.json({ ok: true, membro: false })
  }

  const telefone = telE164(texto(body.telefone, 40) || '')
  const email = texto(body.email, 160)
  const emailOk = email && emailValido(email) ? email.toLowerCase() : null
  const cpf = cpfDigitos(texto(body.cpf, 20) || '')

  /* A checagem de membro é o que evita reescrever a linha de `purchases` de
     quem já paga pela Stripe (achado da Fase 1). Roda já no passo do
     telefone pra avisar antes de a pessoa digitar CPF à toa. */
  let membro = false
  if (telefone || emailOk) {
    membro = await jaEMembro({ telefone, email: emailOk })
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ ok: true, membro })
  }

  const linha: Record<string, unknown> = {
    visitante_id,
    atualizado_em: new Date().toISOString(),
  }

  const pagina = texto(body.pagina, 40)
  if (pagina && PAGINAS.has(pagina)) linha.pagina = pagina

  const versao = typeof body.versao_id === 'number' ? Math.trunc(body.versao_id) : NaN
  if (Number.isFinite(versao) && versao >= 0 && versao < 100000) linha.versao_id = versao

  const sck = texto(body.sck, 200)
  if (sck) linha.sck = sck

  if (telefone) linha.telefone = telefone

  const nome = texto(body.nome, 120)
  if (nome) linha.nome = nome

  if (cpf.length === 11 && cpfValido(cpf)) linha.cpf = cpf
  if (emailOk) linha.email = emailOk

  const metodo = texto(body.metodo, 12)
  if (metodo && METODOS.has(metodo)) linha.metodo = metodo

  const estado = texto(body.estado, 24)

  try {
    const db = createServiceClient()

    if (estado && ESTADOS.has(estado)) {
      const { data: atual } = await db
        .from('pre_checkout')
        .select('estado')
        .eq('visitante_id', visitante_id)
        .maybeSingle()
      const agora = atual ? (RANK[String(atual.estado)] ?? 0) : 0
      if ((RANK[estado] ?? 0) > agora) linha.estado = estado
    }

    const { error } = await db.from('pre_checkout').upsert(linha, { onConflict: 'visitante_id' })
    if (error) console.error('[pre-checkout] upsert falhou:', error.message)
  } catch (e) {
    console.error('[pre-checkout] upsert explodiu:', e)
  }

  return NextResponse.json({ ok: true, membro })
}
