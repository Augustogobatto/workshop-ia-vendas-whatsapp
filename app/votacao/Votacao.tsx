'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LogoWhatsApp, LogoTelegram } from './Logos'

type Opcao = 'whatsapp' | 'telegram'

type Resultado = {
  encerrada: boolean
  admin?: boolean
  prazo: string
  whatsapp?: number
  telegram?: number
  total?: number
  votos?: { ip: string; device: string; ua: string | null; opcao: Opcao; quando: string }[] | null
}

const LS_VOTO = 'club-votacao-grupo-2026-09'

const OPCOES: { id: Opcao; titulo: string; linha: string; cor: string }[] = [
  { id: 'whatsapp', titulo: 'Migrar pro WhatsApp', linha: 'Grupo novo no app que todo mundo já abre todo dia.', cor: '#25D366' },
  { id: 'telegram', titulo: 'Manter no Telegram', linha: 'Fica como está, no grupo de hoje.', cor: '#26A5E4' },
]

const ERROS: Record<string, string> = {
  opcao: 'Escolhe uma das duas opções.',
  device: 'Seu navegador bloqueou o cookie que identifica o aparelho. Libera cookies pra este site e tenta de novo.',
  limite_ip: 'Muitos votos saíram desta mesma rede. Tenta pelo 4G ou me chama no direct.',
  config: 'A votação está fora do ar por um instante. Tenta de novo em um minuto.',
  encerrada: 'A votação encerrou dia 10. Obrigado a quem votou.',
  rede: 'Não consegui registrar. Dá uma olhada na conexão e tenta de novo.',
}

export default function Votacao() {
  const [chave, setChave] = useState<string | null>(null)
  const [pronto, setPronto] = useState(false)

  const [enviando, setEnviando] = useState<Opcao | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [votoFeito, setVotoFeito] = useState<{ opcao: Opcao; trocou: boolean } | null>(null)
  const [trocando, setTrocando] = useState(false)
  const [resultado, setResultado] = useState<Resultado | null>(null)

  useEffect(() => {
    let c: string | null = null
    try {
      c = new URLSearchParams(window.location.search).get('chave')
    } catch {}
    setChave(c)
    setPronto(true)
  }, [])

  useEffect(() => {
    if (!pronto) return
    try {
      const salvo = localStorage.getItem(LS_VOTO)
      if (salvo) {
        const s = JSON.parse(salvo)
        if (s.opcao === 'whatsapp' || s.opcao === 'telegram') setVotoFeito({ opcao: s.opcao, trocou: false })
      }
    } catch {}

    const supabase = createClient()
    ;(async () => {
      try {
        const { data } = await supabase.rpc('club_votacao_resultado', chave ? { p_chave: chave } : {})
        if (data) setResultado(data as Resultado)
      } catch {}
    })()
  }, [pronto, chave])

  async function votar(opcao: Opcao) {
    setErro(null)
    setEnviando(opcao)
    try {
      const r = await fetch('/api/votacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ opcao }),
      })
      const data = await r.json().catch(() => null)
      if (!data) throw new Error('rede')
      if (!data.ok) return setErro(ERROS[data.erro] ?? ERROS.rede)
      setVotoFeito({ opcao, trocou: !!data.trocou })
      setTrocando(false)
      try {
        localStorage.setItem(LS_VOTO, JSON.stringify({ opcao }))
      } catch {}
    } catch {
      setErro(ERROS.rede)
    } finally {
      setEnviando(null)
    }
  }

  const encerrada = !!resultado?.encerrada
  const mostraPlacar = resultado && (resultado.encerrada || resultado.admin)
  const mostraBotoes = !encerrada && (!votoFeito || trocando)

  return (
    <main style={S.main}>
      <section style={{ ...S.wrap, paddingTop: 'clamp(56px, 12vw, 112px)' }}>
        <h1 style={S.h1}>Nós deveríamos migrar o grupo do Club do Telegram para o WhatsApp?</h1>

        <div style={S.texto}>
          <p style={S.p}>
            Algumas pessoas comentaram que não estão acostumadas a usar o Telegram no dia a dia, e isso diminui a
            nossa interação no grupo. Mas gostaria de saber da maioria…{' '}
            <strong style={S.forte}>Devemos migrar?</strong>
          </p>
        </div>
      </section>

      {mostraPlacar && resultado && <Placar r={resultado} />}

      {mostraBotoes && (
        <section style={{ ...S.wrap, marginTop: 40 }}>
          <div role="group" aria-label="Seu voto" style={S.opcoes}>
            {OPCOES.map((o) => {
              const ocupado = enviando === o.id
              return (
                <button
                  key={o.id}
                  type="button"
                  disabled={enviando !== null}
                  onClick={() => votar(o.id)}
                  style={{ ...S.opcao, opacity: enviando && !ocupado ? 0.5 : 1 }}
                  className="voto-btn"
                >
                  <span style={{ ...S.logo, color: o.cor }}>
                    {o.id === 'whatsapp' ? <LogoWhatsApp size={30} /> : <LogoTelegram size={30} />}
                  </span>
                  <span style={{ display: 'grid', gap: 4 }}>
                    <span style={S.opcaoTitulo}>{ocupado ? 'Registrando…' : o.titulo}</span>
                    <span style={S.opcaoLinha}>{o.linha}</span>
                  </span>
                </button>
              )
            })}
          </div>

          {erro && (
            <p role="alert" style={{ ...S.erro, marginTop: 18 }}>
              {erro}
            </p>
          )}

        </section>
      )}

      {!encerrada && votoFeito && !trocando && (
        <section style={{ ...S.wrap, marginTop: 40 }}>
          <div style={S.confirmacao}>
            <p style={S.eyebrow}>{votoFeito.trocou ? 'voto atualizado' : 'voto registrado'}</p>
            <p style={{ ...S.confirmaTitulo, display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ color: OPCOES.find((o) => o.id === votoFeito.opcao)?.cor, display: 'inline-flex' }}>
                {votoFeito.opcao === 'whatsapp' ? <LogoWhatsApp size={34} /> : <LogoTelegram size={34} />}
              </span>
              {OPCOES.find((o) => o.id === votoFeito.opcao)?.titulo}
            </p>
            <p style={{ ...S.p, marginTop: 10 }}>Valeu. Resultado sai depois do dia 10, aqui nesta página e no grupo.</p>
            <button type="button" onClick={() => setTrocando(true)} style={S.linkBtn}>
              Mudar meu voto
            </button>
          </div>
        </section>
      )}

      {encerrada && !mostraPlacar && (
        <section style={{ ...S.wrap, marginTop: 40 }}>
          <p style={S.p}>{ERROS.encerrada}</p>
        </section>
      )}

      <footer style={{ ...S.wrap, marginTop: 'clamp(64px, 11vw, 104px)' }}>
        <p style={{ fontSize: 13, color: '#555' }}>Augusto Gobatto · Push Club</p>
      </footer>

      <style>{`
        .voto-btn:hover:not(:disabled) { border-color: #4A4A4A !important; background: var(--bg-3) !important; }
        .voto-btn:focus-visible { outline: 2px solid #FFFFFF; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) { .voto-btn { transition: none !important; } }
      `}</style>
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
    <section style={{ ...S.wrap, marginTop: 40 }}>
      <div style={S.placar}>
        <p style={S.eyebrow}>
          {r.encerrada ? 'resultado final' : 'parcial ao vivo · só você vê'} · {total} {total === 1 ? 'voto' : 'votos'}
        </p>
        {total === 0 ? (
          <p style={{ ...S.p, marginTop: 12 }}>Nenhum voto ainda.</p>
        ) : (
          <div style={{ display: 'grid', gap: 18, marginTop: 18 }}>
            {OPCOES.map((o) => {
              const n = o.id === 'whatsapp' ? w : t
              const ganhou = vence === o.id
              return (
                <div key={o.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <span style={{ ...S.opcaoTitulo, display: 'inline-flex', alignItems: 'center', gap: 10, color: ganhou ? 'var(--text)' : '#9A9A9A' }}>
                      <span style={{ color: o.cor, display: 'inline-flex' }}>
                        {o.id === 'whatsapp' ? <LogoWhatsApp size={20} /> : <LogoTelegram size={20} />}
                      </span>
                      {o.titulo}
                    </span>
                    <span style={{ ...S.num, color: ganhou ? 'var(--text)' : '#9A9A9A' }}>
                      {pct(n)}% <span style={{ color: '#666', fontWeight: 400 }}>· {n}</span>
                    </span>
                  </div>
                  <div style={S.barraFundo}>
                    <div style={{ ...S.barra, width: `${pct(n)}%`, background: ganhou ? o.cor : '#4A4A4A' }} />
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
                  <th style={S.th}>Voto</th>
                  <th style={S.th}>IP</th>
                  <th style={S.th}>Aparelho</th>
                  <th style={S.th}>Quando</th>
                </tr>
              </thead>
              <tbody>
                {r.votos.map((v) => (
                  <tr key={v.ip + v.device}>
                    <td style={S.td}>{v.opcao === 'whatsapp' ? 'WhatsApp' : 'Telegram'}</td>
                    <td style={{ ...S.td, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{v.ip}</td>
                    <td style={{ ...S.td, color: '#9A9A9A', fontSize: 13 }} title={v.ua ?? ''}>
                      {v.device} · {resumoUa(v.ua)}
                    </td>
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

function resumoUa(ua: string | null) {
  if (!ua) return '?'
  if (/iPhone/.test(ua)) return 'iPhone'
  if (/Android/.test(ua)) return 'Android'
  if (/Macintosh/.test(ua)) return 'Mac'
  if (/Windows/.test(ua)) return 'Windows'
  return 'outro'
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
    fontSize: 'clamp(30px, 6vw, 52px)',
    letterSpacing: '-0.035em',
    lineHeight: 1.04,
    color: 'var(--text)',
    textWrap: 'balance',
  } as React.CSSProperties,
  texto: { display: 'grid', gap: 14, marginTop: 30, maxWidth: 600 } as React.CSSProperties,
  p: { fontSize: 'clamp(15px, 2.6vw, 17px)', color: '#9A9A9A', lineHeight: 1.65 } as React.CSSProperties,
  forte: { color: 'var(--text)', fontWeight: 500 } as React.CSSProperties,
  opcoes: { display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' } as React.CSSProperties,
  opcao: {
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '20px 20px',
    border: '1px solid var(--border-2)',
    background: 'var(--bg-2)',
    color: 'var(--text)',
    borderRadius: 'var(--radius-lg)',
    cursor: 'pointer',
    font: 'inherit',
    transition: 'background .15s, border-color .15s, opacity .15s',
  } as React.CSSProperties,
  logo: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 52,
    height: 52,
    flex: '0 0 52px',
    borderRadius: 12,
    background: '#121212',
    border: '1px solid var(--border)',
  } as React.CSSProperties,
  opcaoTitulo: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 19,
    letterSpacing: '-0.02em',
    lineHeight: 1.15,
  } as React.CSSProperties,
  opcaoLinha: { fontSize: 14, lineHeight: 1.45, color: 'var(--text-muted)' } as React.CSSProperties,
  erro: {
    fontSize: 14,
    color: 'var(--yellow)',
    borderLeft: '2px solid var(--yellow)',
    paddingLeft: 12,
    lineHeight: 1.5,
  } as React.CSSProperties,
  confirmacao: { borderTop: '1px solid var(--border-2)', paddingTop: 30 } as React.CSSProperties,
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
