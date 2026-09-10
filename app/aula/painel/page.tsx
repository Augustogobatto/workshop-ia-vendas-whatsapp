import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import BotaoRecarregar from './BotaoRecarregar'
import './painel.css'

/**
 * Painel do funil da /aula: do anúncio até o checkout, num lugar só.
 *
 * A mídia vem da tabela `vsl_midia`, que um cron na vps-claude regrava de 15
 * em 15 minutos (`club-funil/coleta_midia.py`). Assim o token do Meta nunca
 * precisa existir na Vercel. O funil vem de `vsl_painel`, que já junta as
 * duas fontes — esta página não faz conta, só desenha.
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

type Linha = {
  dia: string; ad_name: string; adset_name: string
  gasto: number; impressoes: number; cliques: number
  ctr: number; cpc: number; cpm: number
  carregou: number; play: number; min1: number; pitch: number; checkout: number
  play_rate: number | null; pct_1min: number | null; pct_pitch: number | null
  custo_play: number | null; custo_pitch: number | null
  atualizado: string
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

  const { data } = await db
    .from('vsl_painel')
    .select('*')
    .gte('dia', de)
    .lte('dia', ate)
    .order('gasto', { ascending: false })

  /* Uma linha por anúncio x público, somando os dias do período. As taxas são
     recalculadas do total — média de porcentagem por dia daria número errado. */
  const mapa = new Map<string, Linha>()
  for (const l of (data || []) as Linha[]) {
    const ch = l.ad_name + '|' + l.adset_name
    const a = mapa.get(ch)
    if (!a) {
      mapa.set(ch, { ...l })
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
  const linhas = Array.from(mapa.values())
    .map((l) => ({
      ...l,
      cpm: l.impressoes ? (1000 * Number(l.gasto)) / l.impressoes : 0,
      ctr: l.impressoes ? (100 * l.cliques) / l.impressoes : 0,
      cpc: l.cliques ? Number(l.gasto) / l.cliques : 0,
      play_rate: l.carregou ? Math.round((100 * l.play) / l.carregou) : null,
      custo_play: l.play ? Number(l.gasto) / l.play : null,
      custo_pitch: l.pitch ? Number(l.gasto) / l.pitch : null,
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
    }),
    { gasto: 0, impressoes: 0, cliques: 0, carregou: 0, play: 0, min1: 0, pitch: 0, checkout: 0 }
  )

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
          <div className="c dest"><b>{t.checkout}</b><span>foram ao checkout</span></div>
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
                  <th className="n">R$/play</th><th className="n">R$/pitch</th>
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
                    <td className="n">{brl(l.custo_play)}</td>
                    <td className="n forte">{brl(l.custo_pitch)}</td>
                  </tr>
                ))}
                {!linhas.length && (
                  <tr><td colSpan={14} className="pn-nada">Nada nesse dia ainda.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="pn-rodape">
          Mídia da tabela <code>vsl_midia</code> (cron de 15 min na vps-claude) · funil da view{' '}
          <code>vsl_painel</code> · robô da Meta e visita interna filtrados por{' '}
          <code>vsl_sessoes_humanas</code>. Marque seu navegador com <code>/aula?eu=1</code>.
        </footer>
      </div>
    </main>
  )
}
