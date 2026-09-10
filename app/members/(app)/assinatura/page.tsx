export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { compraDoClubDoUsuario } from './_dados'
import { buscarAssinatura, type ResumoAssinatura, type StripeFatura } from '@/lib/stripe'
import { PortalButton } from './_portal-button'

const SUPORTE = 'https://wa.me/5519988922649'

// ── Formatação: pt-BR, fuso de São Paulo, R$ ──────────────────

const FUSO = 'America/Sao_Paulo'

function dataLonga(epochSegundos: number | null | undefined): string | null {
  if (!epochSegundos) return null
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: FUSO, day: '2-digit', month: 'long', year: 'numeric',
  }).format(new Date(epochSegundos * 1000))
}

function dataCurta(epochSegundos: number | null | undefined): string | null {
  if (!epochSegundos) return null
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: FUSO, day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(epochSegundos * 1000))
}

function dataDeISO(iso: string | null | undefined): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: FUSO, day: '2-digit', month: 'long', year: 'numeric',
  }).format(d)
}

/** Último pagamento + 30 dias. É como o Asaas agenda o débito seguinte —
 *  aproximação honesta, por isso a tela mostra "≈". */
function mais30Dias(iso: string | null | undefined): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  d.setDate(d.getDate() + 30)
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: FUSO, day: '2-digit', month: 'long', year: 'numeric',
  }).format(d)
}

function dinheiro(centavos: number | null | undefined, moeda: string | null | undefined): string | null {
  if (centavos == null) return null
  const code = (moeda ?? 'BRL').toUpperCase()
  try {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: code }).format(centavos / 100)
  } catch {
    return `${code} ${(centavos / 100).toFixed(2)}`
  }
}

function periodicidade(intervalo: ResumoAssinatura['intervalo'], contagem: number | null): string | null {
  if (!intervalo) return null
  const n = contagem ?? 1
  const singular: Record<string, string> = { day: 'por dia', week: 'por semana', month: 'por mês', year: 'por ano' }
  const plural: Record<string, string> = { day: 'dias', week: 'semanas', month: 'meses', year: 'anos' }
  return n === 1 ? singular[intervalo] ?? null : `a cada ${n} ${plural[intervalo] ?? intervalo}`
}

const BANDEIRAS: Record<string, string> = {
  visa: 'Visa', mastercard: 'Mastercard', amex: 'American Express',
  elo: 'Elo', hipercard: 'Hipercard', discover: 'Discover',
  diners: 'Diners Club', jcb: 'JCB', unionpay: 'UnionPay',
}

const ROTULO_FATURA: Record<string, string> = {
  paid: 'Paga', open: 'Em aberto', draft: 'Rascunho',
  uncollectible: 'Não paga', void: 'Cancelada',
}

// ── Estado da assinatura em linguagem de gente ────────────────

type Tom = 'ok' | 'aviso' | 'erro' | 'neutro'

const COR: Record<Tom, string> = {
  ok: 'var(--green)', aviso: 'var(--yellow)', erro: 'var(--red)', neutro: 'var(--text-muted)',
}

function leituraDoStatus(a: ResumoAssinatura): { tom: Tom; titulo: string; explicacao: string } {
  const fim = dataLonga(a.fimDoPeriodo)
  const cancelada = dataLonga(a.canceladaEm)

  switch (a.status) {
    case 'active':
      if (a.cancelaNoFimDoPeriodo) {
        return {
          tom: 'aviso',
          titulo: 'Cancelamento agendado',
          explicacao: fim
            ? `Não haverá nova cobrança. Teu acesso continua até ${fim}.`
            : 'Não haverá nova cobrança. Teu acesso continua até o fim do período já pago.',
        }
      }
      if (a.faturaEmAberto) {
        return {
          tom: 'aviso',
          titulo: 'Ativa, mas com uma fatura em aberto',
          explicacao: 'A assinatura está ativa na Stripe, só que a fatura abaixo ainda não foi paga. Se você gerou boleto ou Pix, ele só conta depois de compensado.',
        }
      }
      return {
        tom: 'ok',
        titulo: 'Assinatura ativa',
        explicacao: fim ? `Tudo em dia. A próxima cobrança é em ${fim}.` : 'Tudo em dia.',
      }

    case 'trialing':
      return {
        tom: 'ok',
        titulo: 'Período de teste',
        explicacao: fim ? `O teste vai até ${fim}. A primeira cobrança acontece nesse dia.` : 'Você está no período de teste.',
      }

    case 'past_due':
      return {
        tom: 'erro',
        titulo: 'Pagamento em atraso',
        explicacao: 'A última cobrança não foi paga. A Stripe vai tentar de novo, mas o acesso pode cair. Paga a fatura abaixo ou troca o cartão pra regularizar.',
      }

    case 'unpaid':
      return {
        tom: 'erro',
        titulo: 'Assinatura suspensa por falta de pagamento',
        explicacao: 'As tentativas de cobrança falharam. Paga a fatura em aberto ou troca o cartão pra voltar a ficar ativo.',
      }

    case 'incomplete':
      return {
        tom: 'erro',
        titulo: 'Primeiro pagamento pendente',
        explicacao: 'A assinatura foi criada, mas o primeiro pagamento ainda não caiu. Boleto e Pix só valem depois de compensados — até lá a assinatura não fica ativa.',
      }

    case 'incomplete_expired':
      return {
        tom: 'erro',
        titulo: 'Pagamento não concluído',
        explicacao: 'O prazo do primeiro pagamento expirou e a assinatura não chegou a ficar ativa. Pra voltar, é preciso assinar de novo.',
      }

    case 'paused':
      return {
        tom: 'aviso',
        titulo: 'Assinatura pausada',
        explicacao: 'A cobrança está pausada. Nenhum valor está sendo lançado no teu cartão.',
      }

    case 'canceled':
    default:
      return {
        tom: 'neutro',
        titulo: 'Assinatura cancelada',
        explicacao: cancelada
          ? `Cancelada em ${cancelada}. Não há cobrança recorrente ativa no teu nome.`
          : 'Não há cobrança recorrente ativa no teu nome.',
      }
  }
}

// ── Blocos visuais ────────────────────────────────────────────

function Cartao({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'var(--bg-2)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '22px 24px',
      ...style,
    }}>
      {children}
    </div>
  )
}

function Titulo() {
  return (
    <div className="fade-up" style={{ marginBottom: 24 }}>
      <h1 style={{
        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26,
        color: 'var(--text)', margin: 0,
      }}>
        Minha assinatura
      </h1>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.55, maxWidth: 560 }}>
        O estado da tua assinatura do Push Club, lido direto da Stripe — plano, próxima cobrança,
        faturas e cartão.
      </p>
    </div>
  )
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', gap: 16,
      padding: '10px 0', borderTop: '1px solid var(--border)',
      fontSize: 13.5,
    }}>
      <span style={{ color: 'var(--text-muted)' }}>{rotulo}</span>
      <span style={{ color: 'var(--text)', textAlign: 'right' }}>{valor}</span>
    </div>
  )
}

function Aviso({ tom, children }: { tom: Tom; children: React.ReactNode }) {
  return (
    <Cartao style={{
      borderColor: tom === 'erro' ? 'rgba(255,69,58,0.35)' : 'var(--border-2)',
      background: tom === 'erro' ? 'rgba(255,69,58,0.06)' : 'var(--bg-2)',
      padding: '18px 20px',
    }}>
      {children}
    </Cartao>
  )
}

function FaturaEmAberto({ fatura }: { fatura: StripeFatura }) {
  const valor = dinheiro(fatura.total, fatura.currency)
  return (
    <Aviso tom="erro">
      <p style={{
        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14.5,
        color: 'var(--text)', margin: 0,
      }}>
        Tem uma fatura em aberto{valor ? ` de ${valor}` : ''}
      </p>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '6px 0 0', lineHeight: 1.55 }}>
        Enquanto ela não for paga, a assinatura não conta como em dia.
      </p>
      {fatura.hosted_invoice_url && (
        <a
          href={fatura.hosted_invoice_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block', marginTop: 14,
            background: 'var(--green)', color: '#0A0A0A',
            padding: '9px 18px', borderRadius: 'var(--radius)',
            fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Pagar agora
        </a>
      )}
    </Aviso>
  )
}

function ListaDeFaturas({ faturas }: { faturas: StripeFatura[] }) {
  if (faturas.length === 0) return null
  return (
    <Cartao>
      <h2 style={{
        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13,
        letterSpacing: '0.06em', textTransform: 'uppercase',
        color: 'var(--text-muted)', margin: '0 0 6px',
      }}>
        Últimas faturas
      </h2>
      {faturas.map((f) => {
        const data = dataCurta(f.created)
        const valor = dinheiro(f.total, f.currency)
        const rotulo = f.status ? ROTULO_FATURA[f.status] ?? f.status : null
        const paga = f.status === 'paid'
        return (
          <div
            key={f.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
              padding: '11px 0', borderTop: '1px solid var(--border)', fontSize: 13.5,
            }}
          >
            <span style={{ color: 'var(--text)', minWidth: 108 }}>{data ?? '—'}</span>
            <span style={{ color: 'var(--text)', minWidth: 86 }}>{valor ?? '—'}</span>
            {rotulo && (
              <span style={{
                fontSize: 11.5,
                color: paga ? 'var(--text-muted)' : 'var(--yellow)',
                border: `1px solid ${paga ? 'var(--border-2)' : 'rgba(255,214,10,0.35)'}`,
                borderRadius: 'var(--radius-sm)',
                padding: '2px 8px',
              }}>
                {rotulo}
              </span>
            )}
            {f.hosted_invoice_url && (
              <a
                href={f.hosted_invoice_url}
                target="_blank"
                rel="noopener noreferrer"
                className="link-muted"
                style={{ marginLeft: 'auto', fontSize: 12.5, textDecoration: 'none' }}
              >
                ver recibo →
              </a>
            )}
          </div>
        )
      })}
    </Cartao>
  )
}

function BlocoCartao({ cartao }: { cartao: NonNullable<ResumoAssinatura['cartao']> }) {
  const bandeira = cartao.brand ? BANDEIRAS[cartao.brand] ?? cartao.brand : null
  const validade = cartao.exp_month && cartao.exp_year
    ? `${String(cartao.exp_month).padStart(2, '0')}/${cartao.exp_year}`
    : null

  // vencido? compara com o mês atual em São Paulo
  let vencido = false
  if (cartao.exp_month && cartao.exp_year) {
    const agora = new Date()
    const ano = Number(new Intl.DateTimeFormat('en-CA', { timeZone: FUSO, year: 'numeric' }).format(agora))
    const mes = Number(new Intl.DateTimeFormat('en-CA', { timeZone: FUSO, month: 'numeric' }).format(agora))
    vencido = cartao.exp_year < ano || (cartao.exp_year === ano && cartao.exp_month < mes)
  }

  if (!bandeira && !cartao.last4 && !validade) return null

  return (
    <Cartao style={{ padding: '18px 24px' }}>
      <h2 style={{
        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13,
        letterSpacing: '0.06em', textTransform: 'uppercase',
        color: 'var(--text-muted)', margin: '0 0 10px',
      }}>
        Forma de pagamento
      </h2>
      <p style={{ fontSize: 14, color: 'var(--text)', margin: 0 }}>
        {[bandeira, cartao.last4 ? `•••• ${cartao.last4}` : null].filter(Boolean).join(' ')}
        {validade && (
          <span style={{ color: vencido ? 'var(--red)' : 'var(--text-muted)' }}>
            {'  ·  '}validade {validade}{vencido ? ' (vencido)' : ''}
          </span>
        )}
      </p>
    </Cartao>
  )
}

function CartaoDeAcesso({
  titulo, explicacao, tom, children,
}: { titulo: string; explicacao: string; tom: Tom; children?: React.ReactNode }) {
  return (
    <Cartao>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
          background: COR[tom],
          boxShadow: tom === 'ok' ? '0 0 0 3px rgba(255,255,255,0.10)' : 'none',
        }} />
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17,
          color: 'var(--text)',
        }}>
          {titulo}
        </span>
      </div>
      <p style={{ fontSize: 13.5, color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, maxWidth: 520 }}>
        {explicacao}
      </p>
      {children}
    </Cartao>
  )
}

function FaleComSuporte({ texto }: { texto?: string }) {
  return (
    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 14, lineHeight: 1.6 }}>
      {texto ? `${texto} ` : ''}
      <a href={SUPORTE} target="_blank" rel="noopener noreferrer" className="link-muted" style={{ textDecoration: 'underline' }}>
        Chama o suporte no WhatsApp
      </a>.
    </p>
  )
}

// ── Página ────────────────────────────────────────────────────

export default async function AssinaturaPage() {
  const r = await compraDoClubDoUsuario()

  // O layout de (app) já barra quem não está logado; isso aqui é o cinto extra.
  if (r.estado === 'sem-sessao' || r.estado === 'sem-cadastro') {
    return (
      <div className="page-wrap" style={{ maxWidth: 680 }}>
        <Titulo />
        <div className="fade-up fade-up-1">
          <CartaoDeAcesso
            tom="neutro"
            titulo="Não consegui identificar teu cadastro"
            explicacao="Faz login de novo. Se continuar assim, é coisa nossa pra resolver."
          >
            <FaleComSuporte />
          </CartaoDeAcesso>
        </div>
      </div>
    )
  }

  // Sem nenhuma compra do Club nesse cadastro.
  if (r.estado === 'sem-compra') {
    return (
      <div className="page-wrap" style={{ maxWidth: 680 }}>
        <Titulo />
        <div className="fade-up fade-up-1">
          <CartaoDeAcesso
            tom="neutro"
            titulo="Não achamos assinatura do Push Club nesse cadastro"
            explicacao="Pode ser que a compra tenha sido feita com outro e-mail. Nesse caso a gente une os cadastros pra você."
          >
            <div style={{ marginTop: 16 }}>
              <Link
                href="/club"
                style={{
                  display: 'inline-block', background: 'var(--green)', color: '#0A0A0A',
                  padding: '11px 22px', borderRadius: 'var(--radius)',
                  fontFamily: 'var(--font-display)', fontSize: 13.5, fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Conhecer o Push Club
              </Link>
            </div>
            <FaleComSuporte texto="Comprou e não aparece aqui?" />
          </CartaoDeAcesso>
        </div>
      </div>
    )
  }

  const compra = r.compra

  // ── Pix Automático (Asaas) ──────────────────────────────────
  // Quem pagou por Pix não tem assinatura na Stripe: não existe portal, não
  // existe cartão e não existe fatura pra buscar. O estado vem das colunas que
  // o `club-pagamentos` escreve a cada evento do Asaas. E o cancelamento NÃO é
  // aqui: Pix Automático se cancela no app do banco do próprio pagador — dizer
  // outra coisa manda o membro procurar um botão que não existe.
  if (compra.payment_provider === 'asaas') {
    const ultimoPagamento = dataDeISO(compra.last_paid_at)
    const proxima = compra.last_paid_at ? mais30Dias(compra.last_paid_at) : null
    const acessoAte = dataDeISO(compra.expires_at)
    const desdeAsaas = dataDeISO(compra.starts_at)

    const cancelada = compra.status === 'cancelled'
    const atrasada = compra.status === 'past_due'

    const tomAsaas: Tom = cancelada ? 'neutro' : atrasada ? 'erro' : 'ok'
    const tituloAsaas = cancelada
      ? 'Pix Automático cancelado'
      : atrasada
        ? 'A cobrança deste mês não entrou'
        : 'Pix Automático ativo'
    const explicacaoAsaas = cancelada
      ? acessoAte
        ? `A autorização foi cancelada. Teu acesso continua até ${acessoAte}.`
        : 'A autorização foi cancelada. Teu acesso continua até o fim do período já pago.'
      : atrasada
        ? 'O banco não conseguiu debitar a mensalidade. Ele tenta de novo em até sete dias. Se não entrar, o acesso cai — confere o saldo e o limite do Pix Automático no app do banco.'
        : 'A cobrança de R$70 sai todo mês direto da tua conta, sem cartão.'

    return (
      <div className="page-wrap" style={{ maxWidth: 680 }}>
        <Titulo />
        <div className="fade-up fade-up-1" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <CartaoDeAcesso tom={tomAsaas} titulo={tituloAsaas} explicacao={explicacaoAsaas}>
            <div style={{ marginTop: 18 }}>
              <Linha rotulo="Forma de pagamento" valor="Pix Automático" />
              {ultimoPagamento && <Linha rotulo="Última cobrança" valor={ultimoPagamento} />}
              {!cancelada && proxima && <Linha rotulo="Próxima cobrança" valor={`≈ ${proxima}`} />}
              {cancelada && acessoAte && <Linha rotulo="Acesso até" valor={acessoAte} />}
              {desdeAsaas && <Linha rotulo="Membro desde" valor={desdeAsaas} />}
            </div>
            {!cancelada && (
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 16, lineHeight: 1.6 }}>
                Pra cancelar, é no app do seu banco, em Pix Automático. A gente não consegue
                cancelar por aqui — quem autoriza e desautoriza o débito é você, no banco.
              </p>
            )}
            <FaleComSuporte texto="Alguma dúvida sobre a cobrança?" />
          </CartaoDeAcesso>
        </div>
      </div>
    )
  }

  // Acesso liberado na mão: equipe, cortesia, conta de teste. Nada de portal —
  // não existe cobrança pra gerenciar. São 12 casos assim na base hoje.
  if (!compra.stripe_subscription_id) {
    const desde = dataDeISO(compra.starts_at)
    return (
      <div className="page-wrap" style={{ maxWidth: 680 }}>
        <Titulo />
        <div className="fade-up fade-up-1" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <CartaoDeAcesso
            tom={compra.status === 'cancelled' ? 'neutro' : 'ok'}
            titulo={compra.status === 'cancelled' ? 'Acesso encerrado' : 'Acesso liberado manualmente'}
            explicacao={
              compra.status === 'cancelled'
                ? 'Esse acesso era liberado na mão e foi encerrado. Não houve cobrança recorrente.'
                : 'Teu acesso ao Push Club é liberado na mão, sem cobrança recorrente. Não há cartão, fatura nem renovação pra acompanhar aqui.'
            }
          >
            {desde && (
              <div style={{ marginTop: 16 }}>
                <Linha rotulo="Acesso desde" valor={desde} />
              </div>
            )}
            <FaleComSuporte texto="Alguma dúvida sobre o teu acesso?" />
          </CartaoDeAcesso>
        </div>
      </div>
    )
  }

  // A partir daqui quem manda é a Stripe.
  let assinatura: ResumoAssinatura | null = null
  let falhou = false
  try {
    assinatura = await buscarAssinatura(compra.stripe_subscription_id, compra.stripe_customer_id)
  } catch (e) {
    console.error('[assinatura] leitura na Stripe falhou:', e)
    falhou = true
  }

  if (falhou || !assinatura) {
    return (
      <div className="page-wrap" style={{ maxWidth: 680 }}>
        <Titulo />
        <div className="fade-up fade-up-1" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <CartaoDeAcesso
            tom="aviso"
            titulo="Não consegui carregar tua assinatura agora"
            explicacao="A consulta ao sistema de cobrança não respondeu. Isso não muda nada no teu acesso nem na tua cobrança — é só esta tela. Recarrega em alguns minutos."
          >
            <FaleComSuporte texto="Se continuar assim:" />
          </CartaoDeAcesso>
          {compra.stripe_customer_id && (
            <Cartao>
              <PortalButton />
            </Cartao>
          )}
        </div>
      </div>
    )
  }

  const a = assinatura
  const { tom, titulo, explicacao } = leituraDoStatus(a)
  const valor = dinheiro(a.valorCentavos, a.moeda)
  const ciclo = periodicidade(a.intervalo, a.intervaloContagem)
  const fim = dataLonga(a.fimDoPeriodo)
  const desde = dataLonga(a.comecouEm) ?? dataDeISO(compra.starts_at)

  const viva = a.status === 'active' || a.status === 'trialing'
  const proximaCobranca = viva && !a.cancelaNoFimDoPeriodo ? fim : null
  const acessoAte = viva && a.cancelaNoFimDoPeriodo ? fim : null
  const mostraFaturaEmAberto = a.faturaEmAberto && a.status !== 'canceled'

  return (
    <div className="page-wrap" style={{ maxWidth: 680 }}>
      <Titulo />

      <div className="fade-up fade-up-1" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <CartaoDeAcesso tom={tom} titulo={titulo} explicacao={explicacao}>
          <div style={{ marginTop: 18 }}>
            {valor && (
              <Linha
                rotulo="Plano"
                valor={ciclo ? `${valor} ${ciclo}` : valor}
              />
            )}
            {proximaCobranca && <Linha rotulo="Próxima cobrança" valor={proximaCobranca} />}
            {acessoAte && <Linha rotulo="Acesso até" valor={acessoAte} />}
            {desde && <Linha rotulo="Membro desde" valor={desde} />}
          </div>

          {compra.stripe_customer_id && (
            <div style={{ marginTop: 22 }}>
              <PortalButton label={viva ? 'Gerenciar assinatura' : 'Ver histórico de cobrança'} />
            </div>
          )}
        </CartaoDeAcesso>

        {mostraFaturaEmAberto && a.faturaEmAberto && <FaturaEmAberto fatura={a.faturaEmAberto} />}

        <ListaDeFaturas faturas={a.faturas} />

        {a.cartao && <BlocoCartao cartao={a.cartao} />}
      </div>
    </div>
  )
}
