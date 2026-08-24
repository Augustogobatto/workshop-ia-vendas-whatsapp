import type { Metadata } from 'next'
import CopiarComando from './CopiarComando'

export const metadata: Metadata = {
  title: '8 skills de infoprodutor — Augusto Gobatto',
  description:
    'Oito procedimentos meus, abertos, do jeito que rodam na minha máquina. Copie a forma, troque a cicatriz pela sua.',
  alternates: { canonical: 'https://ia.augustogobatto.com/skills' },
  openGraph: {
    title: '8 skills de infoprodutor',
    description: 'Oito procedimentos meus, abertos. Copie a forma, troque a cicatriz pela sua.',
    url: 'https://ia.augustogobatto.com/skills',
    type: 'website',
  },
}

const ZIP = '/downloads/skills-infoprodutor-v1.zip'

const GRUPOS = [
  {
    titulo: 'Dinheiro',
    nota: 'a operação que sustenta a venda depois que a copy já está pronta',
    skills: [
      {
        nome: 'vigia',
        linha: 'Constrói o alarme que dispara quando a venda quebra.',
        cicatriz:
          'Escrevi um vigia que ficou verde por 34 horas seguidas enquanto o checkout tinha parado de converter pro tráfego pago. Ele agregava o total, e o total nunca zerou.',
      },
      {
        nome: 'rastreio',
        linha: 'Faz a origem da venda sobreviver da página até o checkout.',
        cicatriz:
          'Auditei uma conta pra saber se a IA tinha vendido. Não deu pra responder: a tag de origem estava vazia em todas as compras da conta, desde a primeira.',
      },
      {
        nome: 'recorrencia',
        linha: 'Acha a assinatura que está morrendo em silêncio.',
        cicatriz:
          'Fui olhar a cobrança de uma empresa minha: R$18.700 em aberto e zero webhooks configurados. Quando falhava, ninguém ficava sabendo.',
      },
      {
        nome: 'vespera',
        linha: 'Responde “estamos prontos?” com o que foi rodado.',
        cicatriz:
          'Véspera de lançamento, três achados: a compra nunca tinha rodado com dinheiro real, o e-mail estava limitado a 30 por hora, e o checkout mostrava a marca de outra empresa.',
      },
    ],
  },
  {
    titulo: 'Conteúdo',
    nota: 'o que decide o teto antes de você ligar a câmera',
    skills: [
      {
        nome: 'filtro',
        linha: 'Dá nota na pauta antes de você gravar.',
        cicatriz:
          'O tema define o teto, o gancho decide quanto do teto você alcança. Gancho bom não salva tema fraco: dá uma fatia maior de nada.',
      },
      {
        nome: 'voz',
        linha: 'Faz a IA escrever com a sua voz, porque a sua voz está escrita.',
        cicatriz:
          'Humanizar texto de IA quase sempre troca uma voz genérica por outra voz genérica. O alvo é mais estreito do que soar humano: é soar como você.',
      },
    ],
  },
  {
    titulo: 'Método',
    nota: 'como eu decido que uma coisa está pronta',
    skills: [
      {
        nome: 'gloop',
        linha: 'Crítica adversarial em rodadas, com regra de parada nomeada.',
        cicatriz:
          'Quatro rodadas de crítica cega numa API minha. Nenhuma veio limpa, nem a última. Ela fecha por teto de rodadas e entrega a lista do que ficou aberto.',
      },
      {
        nome: 'fim',
        linha: 'Fecha a sessão gravando o que a IA aprendeu.',
        cicatriz:
          'A sessão produz duas coisas: o resultado, que fica no arquivo, e o contexto, que evapora quando você fecha a janela.',
      },
    ],
  },
]

const S = {
  wrap: {
    maxWidth: 880,
    margin: '0 auto',
    padding: '0 24px',
  } as React.CSSProperties,
  h2: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 'clamp(24px, 4.4vw, 34px)',
    letterSpacing: '-0.025em',
    lineHeight: 1.15,
    color: 'var(--text)',
  } as React.CSSProperties,
  h3: {
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    fontSize: 17,
    letterSpacing: '-0.01em',
    color: '#D6D6D6',
    marginTop: 26,
  } as React.CSSProperties,
  p: {
    fontSize: 'clamp(15px, 2.6vw, 17px)',
    color: '#9A9A9A',
    lineHeight: 1.65,
  } as React.CSSProperties,
}

const AVULSOS = ['vigia', 'rastreio', 'recorrencia', 'vespera', 'filtro', 'voz', 'gloop', 'fim']

export default function SkillsPage() {
  return (
    <main style={{ minHeight: '100dvh', paddingBottom: 96 }}>
      {/* ── HERO ───────────────────────────────────────── */}
      <section style={{ ...S.wrap, paddingTop: 'clamp(56px, 12vw, 112px)' }}>
        <p
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: 12,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            marginBottom: 22,
          }}
        >
          @augustogobatto · v1 · 24.08.2026
        </p>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(38px, 8.5vw, 76px)',
            letterSpacing: '-0.04em',
            lineHeight: 0.98,
            color: 'var(--text)',
          }}
        >
          8 skills de
          <br />
          infoprodutor
        </h1>

        <p style={{ ...S.p, fontSize: 'clamp(17px, 3vw, 21px)', color: '#B4B4B4', maxWidth: 620, marginTop: 26 }}>
          Oito procedimentos meus, abertos, do jeito que rodam na minha máquina.
        </p>

        <p style={{ ...S.p, maxWidth: 620, marginTop: 16 }}>
          Eu abri para você copiar <strong style={{ color: 'var(--text)', fontWeight: 500 }}>a forma</strong>, não o
          conteúdo. A cicatriz de cada uma é minha. Trocada pela sua, vira a skill mais útil que você tem.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', marginTop: 38 }}>
          <a
            href={ZIP}
            download
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              background: '#FFFFFF',
              color: '#080808',
              fontWeight: 600,
              fontSize: 16,
              padding: '15px 28px',
              borderRadius: 'var(--radius)',
              letterSpacing: '-0.01em',
            }}
          >
            Baixar o pack
            <span style={{ opacity: 0.5, fontWeight: 400 }}>·  24 KB</span>
          </a>
          <span style={{ fontSize: 13, color: '#7A7A7A' }}>
            .zip com 8 pastas · MIT · sem cadastro
          </span>
        </div>
      </section>

      {/* ── O QUE É ─────────────────────────────────────── */}
      <section style={{ ...S.wrap, marginTop: 'clamp(64px, 11vw, 104px)' }}>
        <div
          style={{
            borderTop: '1px solid var(--border-2)',
            paddingTop: 34,
            display: 'grid',
            gap: 30,
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          }}
        >
          <div>
            <h2 style={{ ...S.h2, fontSize: 'clamp(20px, 3.4vw, 26px)' }}>O que é uma skill</h2>
            <p style={{ ...S.p, marginTop: 14 }}>
              Uma pasta com um arquivo <code style={{ color: '#DADADA' }}>SKILL.md</code> dentro. No topo, um nome e uma
              descrição. Embaixo, o procedimento escrito em português.
            </p>
          </div>
          <div>
            <h2 style={{ ...S.h2, fontSize: 'clamp(20px, 3.4vw, 26px)' }}>Por que não é um prompt salvo</h2>
            <p style={{ ...S.p, marginTop: 14 }}>
              A diferença está em onde ele mora. Prompt mora no seu bloco de notas e depende de você lembrar de colar.
              Skill mora no lugar onde a IA procura, é versionada junto com o projeto, e quem entrar depois herda.
            </p>
          </div>
        </div>
      </section>

      {/* ── AS 8 ────────────────────────────────────────── */}
      <section style={{ ...S.wrap, marginTop: 'clamp(64px, 11vw, 104px)' }}>
        {GRUPOS.map((g) => (
          <div key={g.titulo} style={{ marginBottom: 52 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap', marginBottom: 22 }}>
              <h2 style={{ ...S.h2, fontSize: 'clamp(22px, 3.6vw, 28px)' }}>{g.titulo}</h2>
              <span style={{ fontSize: 14, color: '#7A7A7A' }}>{g.nota}</span>
            </div>

            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
              {g.skills.map((s) => (
                <article
                  key={s.nome}
                  style={{
                    background: 'var(--bg-2)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '22px 24px 24px',
                  }}
                >
                  <h3
                    style={{
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                      fontSize: 15,
                      color: 'var(--text)',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    /{s.nome}
                  </h3>
                  <p style={{ fontSize: 16, color: '#C8C8C8', marginTop: 10, lineHeight: 1.5 }}>{s.linha}</p>
                  <p
                    style={{
                      fontSize: 14.5,
                      color: '#7E7E7E',
                      marginTop: 14,
                      paddingTop: 14,
                      borderTop: '1px solid var(--border)',
                      lineHeight: 1.6,
                    }}
                  >
                    {s.cicatriz}
                  </p>
                </article>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* ── INSTALAÇÃO ──────────────────────────────── */}
      <section style={{ ...S.wrap, marginTop: 'clamp(40px, 8vw, 72px)' }}>
        <div style={{ borderTop: '1px solid var(--border-2)', paddingTop: 34 }}>
          <h2 style={S.h2}>Instalar</h2>

          <h3 style={S.h3}>Claude Code, no projeto</h3>
          <p style={{ ...S.p, marginTop: 10, maxWidth: 640 }}>
            É esta que fica no git e que a próxima pessoa do time herda.
          </p>
          <CopiarComando comando={'unzip -n skills-infoprodutor-v1.zip && cp -rn skills-infoprodutor-v1/skills/* .claude/skills/'} />

          <h3 style={{ ...S.h3, marginTop: 34 }}>Claude Code, só para você</h3>
          <CopiarComando comando={'cp -rn skills-infoprodutor-v1/skills/* ~/.claude/skills/'} />

          <p style={{ ...S.p, fontSize: 14.5, marginTop: 18, maxWidth: 640 }}>
            O <code style={{ color: '#DADADA' }}>-n</code> não sobrescreve. Se você já tem uma skill com um desses nomes
            (<code style={{ color: '#DADADA' }}>fim</code>, <code style={{ color: '#DADADA' }}>voz</code>,{' '}
            <code style={{ color: '#DADADA' }}>filtro</code> e <code style={{ color: '#DADADA' }}>gloop</code> são
            genéricos, então é provável), a sua fica de pé e a minha não entra. Renomeie a minha antes de copiar.
          </p>

          <h3 style={{ ...S.h3, marginTop: 34 }}>claude.ai</h3>
          <p style={{ ...S.p, marginTop: 10, maxWidth: 640 }}>
            Configurações &gt; Recursos &gt; Skills, e sobe o zip. Precisa de plano pago com execução de código ligada.
            Lá é <strong style={{ color: '#C8C8C8', fontWeight: 500 }}>um zip por skill</strong>, então use os avulsos:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
            {AVULSOS.map((n) => (
              <a
                key={n}
                href={`/downloads/skills/${n}.zip`}
                download
                style={{
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  fontSize: 13,
                  color: '#C8C8C8',
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border-2)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 13px',
                }}
              >
                {n}.zip
              </a>
            ))}
          </div>

          <h3 style={{ ...S.h3, marginTop: 34 }}>Conferir que instalou</h3>
          <p style={{ ...S.p, marginTop: 10, maxWidth: 640 }}>
            Digite <code style={{ color: '#DADADA' }}>/gloop</code>. Se autocompletar, entrou. Depois peça{' '}
            <em style={{ color: '#C8C8C8' }}>“revisa isso antes de eu publicar”</em> e veja se ela carrega sozinha.
          </p>

          <h3 style={{ ...S.h3, marginTop: 34 }}>ChatGPT e Gemini</h3>
          <p style={{ ...S.p, marginTop: 10, maxWidth: 640 }}>
            É markdown puro, então cola num Project ou numa Gem e funciona. Só que aí quem escolhe o que entra na
            conversa é você, e não a IA.
          </p>
        </div>
      </section>

      {/* ── RODAPÉ ──────────────────────────────────────── */}
      <section style={{ ...S.wrap, marginTop: 'clamp(48px, 9vw, 80px)' }}>
        <div
          style={{
            borderTop: '1px solid var(--border-2)',
            paddingTop: 26,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 16,
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <p style={{ fontSize: 13.5, color: '#6E6E6E' }}>
            v1 · 24 de agosto de 2026 · licença MIT · o pack muda, a página fica no mesmo endereço
          </p>
          <a
            href="https://instagram.com/augustogobatto"
            target="_blank"
            rel="noopener"
            style={{ fontSize: 13.5, color: '#9A9A9A', borderBottom: '1px solid var(--border-2)', paddingBottom: 2 }}
          >
            travou na instalação? me chama no direct →
          </a>
        </div>
      </section>
    </main>
  )
}
