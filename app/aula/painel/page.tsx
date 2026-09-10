import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import BotaoRecarregar from './BotaoRecarregar'
import './painel.css'

/**
 * Painel do funil da /aula: do anúncio até o checkout, num lugar só.
 *
 * A mídia vem da tabela `vsl_midia`, que um cron na vps-claude regrava de 2
 * em 2 minutos (`club-funil/coleta_midia.py`). Assim o token do Meta nunca
 * precisa existir na Vercel. O funil vem de `vsl_painel`, que já junta as
 * duas fontes. A venda vem de `vsl_vendas`: o webhook do Stripe (stripe-capi
 * na vps-claude) grava cada compra em `meta_capi_log` com o `visitante_id`
 * que a página mandou como `client_reference_id`, e a view cruza com
 * `rastreio_visitantes` pra achar o anúncio e o público do comprador. Só
 * compra real e paga entra (teste assinado e boleto em aberto ficam de fora).
 *
 * O cruzamento venda x anúncio é por nome (ad_name|adset_name), não por dia:
 * quem clica hoje e paga amanhã cai no anúncio certo, e o gasto do período
 * inteiro é o que importa pro CAC e pro ROAS.
 *
 * Protegido por chave na URL, como o /votacao. Não é dado sensível, mas também
 * não é pra sair pelo Google.
 */

const CHAVE = 'cd2dbb919854c591'

export const metadata: Metadata = {
  title: 'Funil VSL',
  robots: { index: false, follow: false },
}
export const dynamic = 'force-dynamic'
export const revalidate = 0

/* Períodos, com as bordas calculadas em São Paulo (o dia do anúncio e o dia
   da sessão têm que fechar no mesmo fuso, senão o gasto de um dia cai no
   funil de outro). */
const PERIODOS = [
  { id: 'hoje', nome: 'Hoje' },
  { id: 'ontem', nome: 'Ontem' },
  { id: 'semana', nome: 'Esta semana' },
  { id: 'semana_passada', nome: 'Semana passada' },
  { id: 'mes', nome: 'Este mês' },
  { id: 'tudo', nome: 'Tudo' },
] as const

type PeriodoId = (typeof PERIODOS)[number]['id']

function emSaoPaulo(d = new Date()) {
  return new Date(d.getTime() - 3 * 3600 * 1000)
}
function iso(d: Date) {
  return d.toISOString().slice(0, 10)
}
function maisDias(d: Date, n: number) {
  const x = new Date(d)
  x.setUTCDate(x.getUTCDate() + n)
  return x
}

/** Devolve [de, ate] em AAAA-MM-DD, inclusivo nas duas pontas. */
function janela(id: PeriodoId): [string, string] {
  const hoje = emSaoPaulo()
  const h = iso(hoje)
  switch (id) {
    case 'ontem': {
      const o = iso(maisDias(hoje, -1))
      return [o, o]
    }
    case 'semana': {
      /* semana começa na segunda: 0=domingo vira 6 */
      const dow = (hoje.getUTCDay() + 6) % 7
      return [iso(maisDias(hoje, -dow)), h]
    }
    case 'semana_passada': {
      const dow = (hoje.getUTCDay() + 6) % 7
      const seg = maisDias(hoje, -dow - 7)
      return [iso(seg), iso(maisDias(seg, 6))]
    }
    case 'mes':
      return [h.slice(0, 8) + '01', h]
    case 'tudo':
      return ['2026-01-01', h]
    default:
      return [h, h]
  }
}

/** Bordas da janela como instante, pro filtro em coluna timestamptz.
 *  As datas do painel já são de São Paulo, então o deslocamento é -03:00. */
function inicioDoDia(dia: string) {
  return `${dia}T00:00:00-03:00`
}
function inicioDoDiaSeguinte(dia: string) {
  const d = new Date(`${dia}T12:00:00-03:00`)
  d.setUTCDate(d.getUTCDate() + 1)
  return `${d.toISOString().slice(0, 10)}T00:00:00-03:00`
}

/* Eventos do pré-checkout (só a /aula-v2 os produz). Contados por SESSÃO
   humana, não por linha: quem clica duas vezes no mensal não vira dois. */
const EVENTOS_PC = [
  'pre_checkout_abriu',
  'pre_checkout_telefone',
  'pre_checkout_metodo',
  'pix_qr_exibido',
] as const

type SessaoHumana = {
  sessao: string
  pagina: string | null
  visitante_id: string | null
  ligou_o_som: boolean | null
  chegou_no_pitch: boolean | null
  clicou: boolean | null
}
type EventoPC = {
  sessao: string | null
  pagina: string | null
  evento: string
  rotulo: string | null
}
type PreCheckoutLinha = { visitante_id: string | null; pagina: string | null }

type Linha = {
  dia: string; ad_name: string; adset_name: string
  gasto: number; impressoes: number; cliques: number
  ctr: number; cpc: number; cpm: number
  carregou: number; play: number; min1: number; pitch: number; checkout: number
  play_rate: number | null; pct_1min: number | null; pct_pitch: number | null
  custo_play: number | null; custo_pitch: number | null
  atualizado: string
  vendas: number; faturado: number
}

type Venda = {
  id: number; criado_em: string; dia: string; plano: 'mensal' | 'anual'
  valor: number; visitante_id: string | null
  ad_name: string | null; adset_name: string | null; pagina: string | null
}

function brl(v: number | null | undefined, casas = 2) {
  if (v === null || v === undefined) return '—'
  return 'R$' + Number(v).toFixed(casas).replace('.', ',')
}
function pct(v: number | null | undefined) {
  return v === null || v === undefined ? '—' : Math.round(Number(v)) + '%'
}
/** abaixo do piso do Felipe = pinta de alerta (skill funil-vsl) */
function piso(v: number | null | undefined, minimo: number) {
  return v !== null && v !== undefined && Number(v) < minimo ? ' abaixo' : ''
}

export default async function Painel({
  searchParams,
}: {
  searchParams: Promise<{ chave?: string; periodo?: string; dia?: string }>
}) {
  const sp = await searchParams
  if (sp.chave !== CHAVE) {
    return (
      <main className="pn">
        <div className="pn-wrap">
          <p className="pn-nada">Painel protegido. Abra com a chave no fim do link.</p>
        </div>
      </main>
    )
  }

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const periodo: PeriodoId = (PERIODOS.find((p) => p.id === sp.periodo)?.id ??
    'hoje') as PeriodoId
  /* ?dia= continua funcionando pra apontar um dia específico */
  const [de, ate] = sp.dia ? [sp.dia, sp.dia] : janela(periodo)

  const deTs = inicioDoDia(de)
  const ateTs = inicioDoDiaSeguinte(ate)

  const [{ data }, { data: vendasData }, { data: sessoesData }, { data: eventosPcData }, { data: preCheckoutData }] =
    await Promise.all([
      db
        .from('vsl_painel')
        .select('*')
        .gte('dia', de)
        .lte('dia', ate)
        .order('gasto', { ascending: false }),
      db
        .from('vsl_vendas')
        .select('id,criado_em,dia,plano,valor,visitante_id,ad_name,adset_name,pagina')
        .gte('dia', de)
        .lte('dia', ate)
        .order('criado_em', { ascending: true }),
      /* já vem sem robô da Meta e sem visita interna */
      db
        .from('vsl_sessoes_humanas')
        .select('sessao,pagina,visitante_id,ligou_o_som,chegou_no_pitch,clicou')
        .gte('chegou_em', deTs)
        .lt('chegou_em', ateTs)
        .limit(20000),
      db
        .from('vsl_eventos')
        .select('sessao,pagina,evento,rotulo')
        .in('evento', EVENTOS_PC as unknown as string[])
        .gte('criado_em', deTs)
        .lt('criado_em', ateTs)
        .limit(20000),
      /* a tabela inteira: é a ponte visitante → braço pra venda que caiu
         depois do período em que a pessoa navegou */
      db.from('pre_checkout').select('visitante_id,pagina').limit(20000),
    ])
  const vendas = (vendasData || []) as Venda[]

  /* Uma linha por anúncio x público, somando os dias do período. As taxas são
     recalculadas do total — média de porcentagem por dia daria número errado. */
  const mapa = new Map<string, Linha>()
  for (const l of (data || []) as Linha[]) {
    const ch = l.ad_name + '|' + l.adset_name
    const a = mapa.get(ch)
    if (!a) {
      mapa.set(ch, { ...l, vendas: 0, faturado: 0 })
      continue
    }
    a.gasto = Number(a.gasto) + Number(l.gasto)
    a.impressoes += l.impressoes
    a.cliques += l.cliques
    a.carregou += l.carregou
    a.play += l.play
    a.min1 += l.min1
    a.pitch += l.pitch
    a.checkout += l.checkout
    if (l.atualizado > a.atualizado) a.atualizado = l.atualizado
  }

  /* Vendas: as que vieram de anúncio entram na linha do anúncio. Se o anúncio
     não tem mídia no período (pausado, ou clique de ontem pagando hoje num
     período de um dia só), a linha nasce zerada em mídia mas com a venda —
     esconder venda é pior que mostrar linha sem gasto. As sem anúncio (/club
     direto, orgânico, rastreio perdido) ficam fora da conta e são listadas. */
  const vendasAds = vendas.filter((v) => v.ad_name)
  const vendasFora = vendas.filter((v) => !v.ad_name)
  for (const v of vendasAds) {
    const ch = v.ad_name + '|' + v.adset_name
    let a = mapa.get(ch)
    if (!a) {
      a = {
        dia: v.dia, ad_name: v.ad_name!, adset_name: v.adset_name || '',
        gasto: 0, impressoes: 0, cliques: 0, ctr: 0, cpc: 0, cpm: 0,
        carregou: 0, play: 0, min1: 0, pitch: 0, checkout: 0,
        play_rate: null, pct_1min: null, pct_pitch: null,
        custo_play: null, custo_pitch: null, atualizado: '',
        vendas: 0, faturado: 0,
      }
      mapa.set(ch, a)
    }
    a.vendas += 1
    a.faturado += Number(v.valor)
  }

  const linhas = Array.from(mapa.values())
    .map((l) => ({
      ...l,
      cpm: l.impressoes ? (1000 * Number(l.gasto)) / l.impressoes : 0,
      ctr: l.impressoes ? (100 * l.cliques) / l.impressoes : 0,
      cpc: l.cliques ? Number(l.gasto) / l.cliques : 0,
      play_rate: l.carregou ? Math.round((100 * l.play) / l.carregou) : null,
      custo_play: l.play ? Number(l.gasto) / l.play : null,
      custo_pitch: l.pitch ? Number(l.gasto) / l.pitch : null,
      cac: l.vendas ? Number(l.gasto) / l.vendas : null,
      roas: Number(l.gasto) ? l.faturado / Number(l.gasto) : null,
    }))
    .sort((a, b) => Number(b.gasto) - Number(a.gasto))

  const t = linhas.reduce(
    (a, l) => ({
      gasto: a.gasto + Number(l.gasto || 0),
      impressoes: a.impressoes + (l.impressoes || 0),
      cliques: a.cliques + (l.cliques || 0),
      carregou: a.carregou + (l.carregou || 0),
      play: a.play + (l.play || 0),
      min1: a.min1 + (l.min1 || 0),
      pitch: a.pitch + (l.pitch || 0),
      checkout: a.checkout + (l.checkout || 0),
      vendas: a.vendas + (l.vendas || 0),
      faturado: a.faturado + (l.faturado || 0),
    }),
    { gasto: 0, impressoes: 0, cliques: 0, carregou: 0, play: 0, min1: 0, pitch: 0, checkout: 0, vendas: 0, faturado: 0 }
  )
  const cac = t.vendas ? t.gasto / t.vendas : null
  const roas = t.gasto ? t.faturado / t.gasto : null
  const mensais = vendasAds.filter((v) => v.plano === 'mensal').length
  const anuais = vendasAds.filter((v) => v.plano === 'anual').length
  const faturadoFora = vendasFora.reduce((a, v) => a + Number(v.valor), 0)

  /* ── Por página: /aula (controle) × /aula-v2 (pré-checkout) ──
     A pergunta do teste é uma só: de quem clicou no mensal, quantos pagaram?
     Tudo aqui é contado por SESSÃO humana, menos as vendas, que são contadas
     por visitante (é a única chave que o pagamento carrega).

     A coluna `pagina` nasceu em 10/09/2026: sessão anterior a isso não tem
     braço e fica de fora — por isso a seção começa vazia e vai enchendo. */
  const sessoes = (sessoesData || []) as SessaoHumana[]
  const eventosPc = (eventosPcData || []) as EventoPC[]
  const preCheckouts = (preCheckoutData || []) as PreCheckoutLinha[]

  const humanas = new Set(sessoes.map((x) => x.sessao))
  const paginaDoVisitante = new Map<string, string>()
  for (const x of sessoes) {
    if (x.visitante_id && x.pagina) paginaDoVisitante.set(x.visitante_id, x.pagina)
  }
  /* o pré-checkout manda mais: ele só existe no braço 2 e é gravado no
     servidor, então vence a leitura vinda do navegador */
  for (const x of preCheckouts) {
    if (x.visitante_id && x.pagina) paginaDoVisitante.set(x.visitante_id, x.pagina)
  }

  type PorPagina = {
    pagina: string
    carregou: number; play: number; pitch: number; clicou: number
    abriu: number; telefone: number; cartao: number; pix: number; qr: number
    vendas: number; faturado: number
  }
  const zeros = (pagina: string): PorPagina => ({
    pagina, carregou: 0, play: 0, pitch: 0, clicou: 0,
    abriu: 0, telefone: 0, cartao: 0, pix: 0, qr: 0, vendas: 0, faturado: 0,
  })
  const porPagina = new Map<string, PorPagina>([
    ['/aula', zeros('/aula')],
    ['/aula-v2', zeros('/aula-v2')],
  ])
  const pega = (pg: string | null) => (pg && porPagina.has(pg) ? porPagina.get(pg)! : null)

  for (const x of sessoes) {
    const p = pega(x.pagina)
    if (!p) continue
    p.carregou += 1
    if (x.ligou_o_som) p.play += 1
    if (x.chegou_no_pitch) p.pitch += 1
    if (x.clicou) p.clicou += 1
  }

  /* distinct por sessão: um clique repetido no mensal não vira dois "abriu" */
  const vistos = new Set<string>()
  for (const e of eventosPc) {
    if (!e.sessao || !humanas.has(e.sessao)) continue
    const p = pega(e.pagina)
    if (!p) continue
    const chave = `${e.sessao}|${e.evento}|${e.rotulo ?? ''}`
    if (vistos.has(chave)) continue
    vistos.add(chave)
    if (e.evento === 'pre_checkout_abriu') p.abriu += 1
    else if (e.evento === 'pre_checkout_telefone') p.telefone += 1
    else if (e.evento === 'pix_qr_exibido') p.qr += 1
    else if (e.evento === 'pre_checkout_metodo') {
      if (e.rotulo === 'cartao') p.cartao += 1
      else if (e.rotulo === 'pix') p.pix += 1
    }
  }

  for (const v of vendas) {
    const pg = v.visitante_id ? paginaDoVisitante.get(v.visitante_id) : null
    const p = pega(pg ?? null)
    if (!p) continue
    p.vendas += 1
    p.faturado += Number(v.valor)
  }

  const bracos = Array.from(porPagina.values())
  const temBraco = bracos.some((b) => b.carregou > 0 || b.vendas > 0)

  const taxa = (a: number, b: number) => (b ? Math.round((100 * a) / b) : null)
  const atualizado = linhas[0]?.atualizado
    ? new Date(linhas[0].atualizado).toLocaleTimeString('pt-BR', {
        timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit',
      })
    : '—'

  /* Idade do dado da mídia. O cron da vps-claude regrava de 2 em 2 minutos;
     se passar de 6, alguma coisa travou (cron parado, token vencido, Graph
     fora) e é melhor a página dizer isso do que mostrar número velho como se
     fosse de agora. */
  const idadeMin = linhas[0]?.atualizado
    ? Math.round((Date.now() - new Date(linhas[0].atualizado).getTime()) / 60000)
    : null
  const dadoVelho = idadeMin !== null && idadeMin > 6

  return (
    <main className="pn">
      <div className="pn-wrap">
        <header className="pn-topo">
          <div>
            <h1>Funil VSL</h1>
            <p className="pn-sub">
              {de === ate
                ? de.split('-').reverse().join('/')
                : `${de.split('-').reverse().join('/')} a ${ate.split('-').reverse().join('/')}`}{' '}
              · só gente (robô da Meta e visita interna ficam de fora)
            </p>
          </div>
          <BotaoRecarregar idadeMin={idadeMin} velho={dadoVelho} />
        </header>

        {dadoVelho && (
          <p className="pn-aviso">
            A última leitura do Meta tem {idadeMin} minutos. O coletor roda de 2 em 2 na
            vps-claude, então algo travou: conferir <code>club-funil/coleta.log</code>. Os números
            de mídia abaixo são dessa leitura antiga; os da página são ao vivo.
          </p>
        )}

        <nav className="pn-abas">
          {PERIODOS.map((p) => (
            <a
              key={p.id}
              href={`?chave=${CHAVE}&periodo=${p.id}`}
              className={'aba' + (p.id === periodo && !sp.dia ? ' viva' : '')}
            >
              {p.nome}
            </a>
          ))}
        </nav>

        <section className="pn-cifras">
          <div className="c"><b>{brl(t.gasto)}</b><span>gasto</span></div>
          <div className="c"><b>{t.impressoes}</b><span>impressões</span></div>
          <div className="c"><b>{t.cliques}</b><span>cliques</span></div>
          <div className="c"><b>{t.carregou}</b><span>carregaram</span></div>
          <div className="c"><b>{t.play}</b><span>deram play</span></div>
          <div className="c"><b>{t.pitch}</b><span>ouviram o preço</span></div>
          <div className="c"><b>{t.checkout}</b><span>foram ao checkout</span></div>
          <div className="c dest"><b>{t.vendas}</b><span>compraram</span></div>
          <div className="c dest"><b>{brl(t.faturado, 0)}</b><span>faturado</span></div>
        </section>

        <section>
          <h2>O retorno</h2>
          <div className="pn-taxas">
            <div className="tx">
              <b>{brl(t.faturado, 0)}</b>
              <span>faturado</span>
              <i>{mensais} mensal · {anuais} anual</i>
            </div>
            <div className="tx">
              <b>{brl(cac, 0)}</b>
              <span>CAC</span><i>gasto ÷ vendas</i>
            </div>
            <div className={'tx' + (roas !== null && roas < 1 ? ' abaixo' : '')}>
              <b>{roas === null ? '—' : roas.toFixed(2).replace('.', ',') + 'x'}</b>
              <span>ROAS</span><i>faturado ÷ gasto · abaixo de 1x paga menos que custou</i>
            </div>
            <div className="tx">
              <b>{pct(taxa(t.vendas, t.checkout))}</b>
              <span>checkout → venda</span><i>quem foi pagar e pagou</i>
            </div>
          </div>
          <p className="pn-nota">
            Faturado é o que entrou no checkout (R$70 do mensal conta R$70, não o ano). Só compra
            paga: boleto em aberto e teste ficam de fora.
            {vendasFora.length > 0 && (
              <>
                {' '}Fora dos anúncios no período: {vendasFora.length}{' '}
                {vendasFora.length === 1 ? 'venda' : 'vendas'} ({brl(faturadoFora, 0)}) —{' '}
                {vendasFora
                  .map((v) => `${v.plano} ${v.pagina || '?'} ${v.visitante_id ? 'sem UTM de anúncio' : 'sem visitante'}`)
                  .join(', ')}
                .
              </>
            )}
          </p>
        </section>

        <section>
          <h2>As taxas</h2>
          <div className="pn-taxas">
            <div className={'tx' + piso(taxa(t.carregou, t.cliques), 70)}>
              <b>{pct(taxa(t.carregou, t.cliques))}</b>
              <span>connect rate</span><i>piso 70%</i>
            </div>
            <div className={'tx' + piso(taxa(t.play, t.carregou), 60)}>
              <b>{pct(taxa(t.play, t.carregou))}</b>
              <span>play rate</span><i>piso 60%</i>
            </div>
            <div className={'tx' + piso(taxa(t.min1, t.play), 60)}>
              <b>{pct(taxa(t.min1, t.play))}</b>
              <span>play → 1º minuto</span><i>piso 60%</i>
            </div>
            <div className="tx">
              <b>{pct(taxa(t.pitch, t.min1))}</b>
              <span>1º minuto → pitch</span><i>retenção da VSL</i>
            </div>
            <div className="tx">
              <b>{pct(taxa(t.checkout, t.pitch))}</b>
              <span>pitch → checkout</span><i>o degrau que decide</i>
            </div>
          </div>
          <p className="pn-nota">
            Pisos da régua do Felipe. Em vermelho, abaixo do piso.
            Custo por play {brl(t.play ? t.gasto / t.play : null)} · por pitch{' '}
            {brl(t.pitch ? t.gasto / t.pitch : null)}
          </p>
        </section>

        <section>
          <h2>Por página</h2>
          <div className="pn-rolagem">
            <table>
              <thead>
                <tr>
                  <th>página</th>
                  <th className="n">carregou</th><th className="n">play</th><th className="n">pitch</th>
                  <th className="n">clicou CTA</th>
                  <th className="n">abriu popup</th><th className="n">telefone</th>
                  <th className="n">cartão</th><th className="n">Pix</th><th className="n">QR</th>
                  <th className="n">vendas</th><th className="n">clicou → venda</th>
                </tr>
              </thead>
              <tbody>
                {bracos.map((b) => (
                  <tr key={b.pagina}>
                    <th>{b.pagina}</th>
                    <td className="n">{b.carregou}</td>
                    <td className="n">{b.play}</td>
                    <td className="n">{b.pitch}</td>
                    <td className="n">{b.clicou}</td>
                    <td className="n">{b.pagina === '/aula' ? '—' : b.abriu}</td>
                    <td className="n">{b.pagina === '/aula' ? '—' : b.telefone}</td>
                    <td className="n">{b.pagina === '/aula' ? '—' : b.cartao}</td>
                    <td className="n">{b.pagina === '/aula' ? '—' : b.pix}</td>
                    <td className="n">{b.pagina === '/aula' ? '—' : b.qr}</td>
                    <td className={'n' + (b.vendas ? ' venda' : '')}>
                      {b.vendas} <small>{brl(b.faturado, 0)}</small>
                    </td>
                    <td className="n forte">{pct(taxa(b.vendas, b.clicou))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="pn-nota">
            {temBraco ? (
              <>
                A pergunta do teste é a última coluna: de quem clicou no mensal, quantos pagaram.
                O <code>/aula</code> é o controle (clique vai direto pro Stripe) e o{' '}
                <code>/aula-v2</code> tem o pré-checkout — as colunas do popup só existem nele.
              </>
            ) : (
              <>
                Nada no período. A coluna <code>pagina</code> nasceu em 10/09/2026: sessão anterior
                a isso não tem braço e fica de fora desta tabela.
              </>
            )}{' '}
            Venda entra no braço pelo <code>pre_checkout</code> do visitante e, quando ele não
            existe (o controle não grava nada), pela <code>pagina</code> da sessão dele.
          </p>
        </section>

        <section>
          <h2>Por anúncio e público</h2>
          <div className="pn-rolagem">
            <table>
              <thead>
                <tr>
                  <th>anúncio</th><th>público</th>
                  <th className="n">gasto</th><th className="n">impr</th><th className="n">CPM</th>
                  <th className="n">CTR</th><th className="n">CPC</th>
                  <th className="n">carr</th><th className="n">play</th><th className="n">1min</th>
                  <th className="n">pitch</th><th className="n">chkt</th>
                  <th className="n">vendas</th><th className="n">fat.</th>
                  <th className="n">R$/play</th><th className="n">R$/pitch</th>
                  <th className="n">CAC</th><th className="n">ROAS</th>
                </tr>
              </thead>
              <tbody>
                {linhas.map((l) => (
                  <tr key={l.ad_name + l.adset_name}>
                    <th>{l.ad_name.replace('-DUAS-RESPOSTAS', '').replace('-GOOGLE-EDUCADO', ' google')}</th>
                    <td>{l.adset_name}</td>
                    <td className="n">{brl(l.gasto)}</td>
                    <td className="n">{l.impressoes}</td>
                    <td className="n">{brl(l.cpm)}</td>
                    <td className="n">{Number(l.ctr).toFixed(1)}%</td>
                    <td className="n">{brl(l.cpc)}</td>
                    <td className="n">{l.carregou}</td>
                    <td className={'n' + piso(l.play_rate, 60)}>
                      {l.play} <small>{pct(l.play_rate)}</small>
                    </td>
                    <td className="n">{l.min1}</td>
                    <td className="n">{l.pitch}</td>
                    <td className="n">{l.checkout}</td>
                    <td className={'n' + (l.vendas ? ' venda' : '')}>{l.vendas}</td>
                    <td className={'n' + (l.vendas ? ' venda' : '')}>{brl(l.faturado, 0)}</td>
                    <td className="n">{brl(l.custo_play)}</td>
                    <td className="n forte">{brl(l.custo_pitch)}</td>
                    <td className="n">{brl(l.cac, 0)}</td>
                    <td className="n forte">
                      {l.roas === null ? '—' : l.roas.toFixed(2).replace('.', ',') + 'x'}
                    </td>
                  </tr>
                ))}
                {!linhas.length && (
                  <tr><td colSpan={18} className="pn-nada">Nada nesse dia ainda.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="pn-rodape">
          Mídia da tabela <code>vsl_midia</code> (cron de 15 min na vps-claude) · funil da view{' '}
          <code>vsl_painel</code> · vendas da view <code>vsl_vendas</code> (webhook do Stripe →{' '}
          <code>meta_capi_log</code> → visitante → anúncio) · robô da Meta e visita interna filtrados por{' '}
          <code>vsl_sessoes_humanas</code>. Marque seu navegador com <code>/aula?eu=1</code>.
        </footer>
      </div>
    </main>
  )
}
