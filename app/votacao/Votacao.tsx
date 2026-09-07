'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Opcao = 'whatsapp' | 'telegram'

type Resultado = {
  encerrada: boolean
  admin?: boolean
  prazo: string
  whatsapp?: number
  telegram?: number
  total?: number
  votos?: { nome: string; fone: string; opcao: Opcao; quando: string }[] | null
}

const PRAZO_TXT = 'quinta, 10/09, até 23h59'
const LS_KEY = 'club-votacao-grupo-2026-09'

const OPCOES: { id: Opcao; titulo: string; linha: string }[] = [
  { id: 'whatsapp', titulo: 'Migrar pro WhatsApp', linha: 'Grupo novo no app que todo mundo já abre todo dia.' },
  { id: 'telegram', titulo: 'Manter no Telegram', linha: 'Fica como está, no grupo de hoje.' },
]

const ERROS: Record<string, string> = {
  fone: 'Esse número não parece um WhatsApp brasileiro. Confere o DDD e tenta de novo.',
  nome: 'Coloca seu nome pra eu saber quem votou.',
  opcao: 'Escolhe uma das duas opções.',
  encerrada: 'A votação encerrou dia 10. Obrigado a quem votou.',
  rede: 'Não consegui registrar. Dá uma olhada na conexão e tenta de novo.',
}

function formatarFone(v: string) {
  const d = v.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '').slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export default function Votacao() {
  const params = useSearchParams()
  const chave = params.get('chave')

  const [opcao, setOpcao] = useState<Opcao | null>(null)
  const [nome, setNome] = useState('')
  const [fone, setFone] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [votoFeito, setVotoFeito] = useState<{ opcao: Opcao; trocou: boolean } | null>(null)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    try {
      const salvo = localStorage.getItem(LS_KEY)
      if (salvo) {
        const s = JSON.parse(salvo)
        setNome(s.nome ?? '')
        setFone(s.fone ?? '')
        if (s.opcao) setVotoFeito({ opcao: s.opcao, trocou: false })
      }
    } catch {}

    const supabase = createClient()
    ;(async () => {
      try {
        const { data } = await supabase.rpc('club_votacao_resultado', chave ? { p_chave: chave } : {})
        if (data) setResultado(data as Resultado)
      } catch {
      } finally {
        setCarregando(false)
      }
    })()
  }, [chave])

  async function votar() {
    setErro(null)
    if (!opcao) return setErro(ERROS.opcao)
    if (nome.trim().length < 2) return setErro(ERROS.nome)
    setEnviando(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.rpc('club_votar', {
        p_nome: nome.trim(),
        p_fone: fone,
        p_opcao: opcao,
      })
      if (error || !data) throw new Error('rede')
      if (!data.ok) return setErro(ERROS[data.erro] ?? ERROS.rede)
      setVotoFeito({ opcao, trocou: !!data.trocou })
      try {
        localStorage.setItem(LS_KEY, JSON.stringify({ nome: nome.trim(), fone, opcao }))
      } catch {}
    } catch {
      setErro(ERROS.rede)
    } finally {
      setEnviando(false)
    }
  }

  const encerrada = !!resultado?.encerrada
  const mostraPlacar = resultado && (resultado.encerrada || resultado.admin)

  return (
    <main style={S.main}>
      <section style={{ ...S.wrap, paddingTop: 'clamp(56px, 12vw, 112px)' }}>
        <p style={S.eyebrow}>Push Club · votação · {encerrada ? 'encerrada' : `aberta ${PRAZO_TXT}`}</p>

        <h1 style={S.h1}>
          WhatsApp
          <br />
          ou Telegram?
        </h1>

        <div style={S.texto}>
          <p style={S.p}>
            Sinto que o nosso grupo no Telegram fica subutilizado. Muita gente não usa o Telegram no dia a dia, e
            eu quero estar mais perto de vocês.
          </p>
          <p style={S.p}>
            Então quero decidir isso junto: <strong style={S.forte}>a gente migra o grupo pro WhatsApp ou mantém no Telegram?</strong>
          </p>
          <p style={S.p}>
            Um voto por pessoa, contado pelo seu WhatsApp. Se mudar de ideia até dia 10, vota de novo com o mesmo
            número e o voto novo substitui o antigo. Depois eu mostro o resultado pra todo mundo e a gente segue com
            o que a maioria escolher.
          </p>
        </div>
      </section>

      {mostraPlacar && resultado && <Placar r={resultado} />}

      {!encerrada && (
        <section style={{ ...S.wrap, marginTop: 44 }}>
          {votoFeito ? (
            <div style={S.confirmacao}>
              <p style={S.eyebrow}>{votoFeito.trocou ? 'voto atualizado' : 'voto registrado'}</p>
              <p style={S.confirmaTitulo}>{OPCOES.find((o) => o.id === votoFeito.opcao)?.titulo}</p>
              <p style={{ ...S.p, marginTop: 10 }}>
                Valeu, {nome.trim().split(' ')[0] || 'membro'}. Resultado sai depois do dia 10, aqui nesta página e
                no grupo.
              </p>
              <button type="button" onClick={() => setVotoFeito(null)} style={S.linkBtn}>
                Mudar meu voto
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                votar()
              }}
              style={{ display: 'grid', gap: 26 }}
            >
              <div role="radiogroup" aria-label="Sua escolha" style={S.opcoes}>
                {OPCOES.map((o) => {
                  const ativo = opcao === o.id
                  return (
                    <button
                      key={o.id}
                      type="button"
                      role="radio"
                      aria-checked={ativo}
                      onClick={() => {
                        setOpcao(o.id)
                        setErro(null)
                      }}
                      style={{
                        ...S.opcao,
                        borderColor: ativo ? '#FFFFFF' : 'var(--border-2)',
                        background: ativo ? '#FFFFFF' : 'var(--bg-2)',
                        color: ativo ? '#080808' : 'var(--text)',
                      }}
                    >
                      <span style={S.opcaoTitulo}>{o.titulo}</span>
                      <span style={{ ...S.opcaoLinha, color: ativo ? '#4A4A4A' : 'var(--text-muted)' }}>{o.linha}</span>
                    </button>
                  )
                })}
              </div>

              <div style={S.campos}>
                <label style={S.label}>
                  <span style={S.labelTxt}>Seu nome</span>
                  <input
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    autoComplete="name"
                    placeholder="Como te chamam no Club"
                    style={S.input}
                    required
                  />
                </label>
                <label style={S.label}>
                  <span style={S.labelTxt}>Seu WhatsApp</span>
                  <input
                    value={fone}
                    onChange={(e) => setFone(formatarFone(e.target.value))}
                    inputMode="tel"
                    autoComplete="tel-national"
                    placeholder="(48) 99999-9999"
                    style={S.input}
                    required
                  />
                </label>
              </div>

              {erro && (
                <p role="alert" style={S.erro}>
                  {erro}
                </p>
              )}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
                <button type="submit" disabled={enviando || carregando} style={{ ...S.cta, opacity: enviando ? 0.6 : 1 }}>
                  {enviando ? 'Registrando…' : 'Confirmar meu voto'}
                </button>
                <span style={{ fontSize: 13, color: '#7A7A7A' }}>Um voto por número. Só eu vejo quem votou.</span>
              </div>
            </form>
          )}
        </section>
      )}

      {encerrada && !mostraPlacar && (
        <section style={{ ...S.wrap, marginTop: 44 }}>
          <p style={S.p}>{ERROS.encerrada}</p>
        </section>
      )}

      <footer style={{ ...S.wrap, marginTop: 'clamp(64px, 11vw, 104px)' }}>
        <p style={{ fontSize: 13, color: '#555' }}>Augusto Gobatto · Push Club</p>
      </footer>
    </main>
  )
}

function Placar({ r }: { r: Resultado }) {
  const w = r.whatsapp ?? 0
  const t = r.telegram ?? 0
  const total = w + t
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0)
  const vence = w === t ? null : w > t ? 'whatsapp' : 'telegram'

  return (
    <section style={{ ...S.wrap, marginTop: 44 }}>
      <div style={S.placar}>
        <p style={S.eyebrow}>
          {r.encerrada ? 'resultado final' : 'parcial ao vivo · só você vê'} · {total} {total === 1 ? 'voto' : 'votos'}
        </p>
        {total === 0 ? (
          <p style={{ ...S.p, marginTop: 12 }}>Nenhum voto ainda.</p>
        ) : (
          <div style={{ display: 'grid', gap: 18, marginTop: 18 }}>
            {(['whatsapp', 'telegram'] as Opcao[]).map((id) => {
              const n = id === 'whatsapp' ? w : t
              const ganhou = vence === id
              return (
                <div key={id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
                    <span style={{ ...S.opcaoTitulo, color: ganhou ? 'var(--text)' : '#9A9A9A' }}>
                      {OPCOES.find((o) => o.id === id)?.titulo}
                    </span>
                    <span style={{ ...S.num, color: ganhou ? 'var(--text)' : '#9A9A9A' }}>
                      {pct(n)}% <span style={{ color: '#666', fontWeight: 400 }}>· {n}</span>
                    </span>
                  </div>
                  <div style={S.barraFundo}>
                    <div style={{ ...S.barra, width: `${pct(n)}%`, background: ganhou ? '#FFFFFF' : '#4A4A4A' }} />
                  </div>
                </div>
              )
            })}
            {r.encerrada && (
              <p style={{ ...S.p, marginTop: 6 }}>
                {vence === null
                  ? 'Empate. Eu decido e conto no grupo.'
                  : vence === 'whatsapp'
                    ? 'Decidido: o grupo vai pro WhatsApp. O link novo chega por aqui e por email.'
                    : 'Decidido: o grupo fica no Telegram.'}
              </p>
            )}
          </div>
        )}

        {r.admin && r.votos && r.votos.length > 0 && (
          <div style={{ marginTop: 26, overflowX: 'auto' }}>
            <table style={S.tabela}>
              <thead>
                <tr>
                  <th style={S.th}>Nome</th>
                  <th style={S.th}>WhatsApp</th>
                  <th style={S.th}>Voto</th>
                  <th style={S.th}>Quando</th>
                </tr>
              </thead>
              <tbody>
                {r.votos.map((v) => (
                  <tr key={v.fone}>
                    <td style={S.td}>{v.nome}</td>
                    <td style={{ ...S.td, fontVariantNumeric: 'tabular-nums' }}>{v.fone}</td>
                    <td style={S.td}>{v.opcao === 'whatsapp' ? 'WhatsApp' : 'Telegram'}</td>
                    <td style={{ ...S.td, color: '#7A7A7A', whiteSpace: 'nowrap' }}>
                      {new Date(v.quando).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

const S = {
  main: { minHeight: '100dvh', paddingBottom: 64 } as React.CSSProperties,
  wrap: { maxWidth: 680, margin: '0 auto', padding: '0 24px' } as React.CSSProperties,
  eyebrow: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 12,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
  } as React.CSSProperties,
  h1: {
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    fontSize: 'clamp(40px, 9vw, 76px)',
    letterSpacing: '-0.04em',
    lineHeight: 0.98,
    color: 'var(--text)',
    marginTop: 22,
    textWrap: 'balance',
  } as React.CSSProperties,
  texto: { display: 'grid', gap: 14, marginTop: 30, maxWidth: 600 } as React.CSSProperties,
  p: { fontSize: 'clamp(15px, 2.6vw, 17px)', color: '#9A9A9A', lineHeight: 1.65 } as React.CSSProperties,
  forte: { color: 'var(--text)', fontWeight: 500 } as React.CSSProperties,
  opcoes: { display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' } as React.CSSProperties,
  opcao: {
    textAlign: 'left',
    display: 'grid',
    gap: 6,
    padding: '20px 20px 18px',
    border: '1px solid',
    borderRadius: 'var(--radius-lg)',
    cursor: 'pointer',
    font: 'inherit',
    transition: 'background .15s, border-color .15s, color .15s',
  } as React.CSSProperties,
  opcaoTitulo: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 19,
    letterSpacing: '-0.02em',
    lineHeight: 1.15,
  } as React.CSSProperties,
  opcaoLinha: { fontSize: 14, lineHeight: 1.45 } as React.CSSProperties,
  campos: { display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' } as React.CSSProperties,
  label: { display: 'grid', gap: 8 } as React.CSSProperties,
  labelTxt: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 11,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
  } as React.CSSProperties,
  input: {
    background: '#0B0B0B',
    border: '1px solid var(--border-2)',
    borderRadius: 'var(--radius)',
    color: 'var(--text)',
    font: 'inherit',
    fontSize: 16,
    padding: '13px 14px',
    outline: 'none',
    width: '100%',
  } as React.CSSProperties,
  erro: {
    fontSize: 14,
    color: 'var(--yellow)',
    borderLeft: '2px solid var(--yellow)',
    paddingLeft: 12,
    lineHeight: 1.5,
  } as React.CSSProperties,
  cta: {
    background: '#FFFFFF',
    color: '#080808',
    border: 0,
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 16,
    padding: '15px 28px',
    borderRadius: 'var(--radius)',
    letterSpacing: '-0.01em',
    cursor: 'pointer',
  } as React.CSSProperties,
  confirmacao: {
    borderTop: '1px solid var(--border-2)',
    paddingTop: 30,
  } as React.CSSProperties,
  confirmaTitulo: {
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    fontSize: 'clamp(26px, 5vw, 36px)',
    letterSpacing: '-0.03em',
    lineHeight: 1.05,
    color: 'var(--text)',
    marginTop: 14,
  } as React.CSSProperties,
  linkBtn: {
    background: 'none',
    border: 0,
    padding: 0,
    marginTop: 18,
    color: '#9A9A9A',
    font: 'inherit',
    fontSize: 14,
    textDecoration: 'underline',
    textUnderlineOffset: 4,
    cursor: 'pointer',
  } as React.CSSProperties,
  placar: {
    background: 'var(--bg-2)',
    border: '1px solid var(--border-2)',
    borderRadius: 'var(--radius-lg)',
    padding: '22px 22px 24px',
  } as React.CSSProperties,
  num: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 22,
    letterSpacing: '-0.02em',
    fontVariantNumeric: 'tabular-nums',
  } as React.CSSProperties,
  barraFundo: { height: 8, background: '#1A1A1A', borderRadius: 4, marginTop: 10, overflow: 'hidden' } as React.CSSProperties,
  barra: { height: '100%', borderRadius: 4, transition: 'width .4s ease' } as React.CSSProperties,
  tabela: { width: '100%', borderCollapse: 'collapse', fontSize: 14 } as React.CSSProperties,
  th: {
    textAlign: 'left',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 11,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    padding: '8px 10px 8px 0',
    borderBottom: '1px solid var(--border-2)',
    fontWeight: 500,
  } as React.CSSProperties,
  td: { padding: '9px 10px 9px 0', borderBottom: '1px solid var(--border)', color: '#D6D6D6' } as React.CSSProperties,
}
