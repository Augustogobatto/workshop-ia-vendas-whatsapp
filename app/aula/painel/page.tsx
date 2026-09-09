import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
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
  title: 'Funil /aula',
  robots: { index: false, follow: false },
}
export const dynamic = 'force-dynamic'
export const revalidate = 0

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
  searchParams: Promise<{ chave?: string; dia?: string }>
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

  const hoje = new Date(Date.now() - 3 * 3600 * 1000).toISOString().slice(0, 10)
  const dia = sp.dia || hoje

  const { data } = await db.from('vsl_painel').select('*').eq('dia', dia).order('gasto', { ascending: false })
  const linhas = (data || []) as Linha[]

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
            <h1>Funil /aula</h1>
            <p className="pn-sub">
              {dia.split('-').reverse().join('/')} · só gente (robô da Meta e visita interna ficam
              de fora)
            </p>
          </div>
          <form>
            <input type="hidden" name="chave" value={CHAVE} />
            {sp.dia && <input type="hidden" name="dia" value={sp.dia} />}
            <button type="submit" className={'pn-btn' + (dadoVelho ? ' alerta' : '')}>
              <span className="giro" aria-hidden>↻</span>
              Recarregar
              <small>
                {idadeMin === null
                  ? 'sem mídia'
                  : idadeMin <= 1
                    ? 'Meta agora há pouco'
                    : `Meta há ${idadeMin} min`}
              </small>
            </button>
          </form>
        </header>

        {dadoVelho && (
          <p className="pn-aviso">
            A última leitura do Meta tem {idadeMin} minutos. O coletor roda de 2 em 2 na
            vps-claude, então algo travou: conferir <code>club-funil/coleta.log</code>. Os números
            de mídia abaixo são dessa leitura antiga; os da página são ao vivo.
          </p>
        )}

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
