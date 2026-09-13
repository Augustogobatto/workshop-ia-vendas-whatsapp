import type { Metadata } from 'next'
import RastreioConteudo from './RastreioConteudo'
import '../(marketing)/club/v7.css'
import './conteudo.css'

/**
 * /conteudo — página de venda da aula "Produção de Conteúdo com IA" (ao vivo,
 * 31/08/2026, 2h20) e, por ela, do Push Club. Feita pra link de stories.
 *
 * v3 (13/09, orientação dele): a página VESTE o conteúdo, não mostra pelado.
 * Mostra o resultado (a curva), o tamanho do que existe (o painel, aba por aba)
 * e QUE os segredos foram abertos na aula. O como (mecanismo, tabela, lição)
 * fica dentro da aula. Cada bloco termina em pergunta aberta, não em resposta.
 *
 * Prints são frames da própria gravação, cortados na área da tela (sem alunos).
 * Números de seguidores/posts conferidos no Supabase do desafio em 12/09/2026.
 * Regras herdadas da /aula e da /club: zero escassez, rastreio pelo contrato
 * único (lib/rastreio.ts), sem "não é X, é Y" (VOZ.md), sem travessão.
 */
export const metadata: Metadata = {
  title: 'Nos primeiros 25 dias fiz 17 seguidores. Nos últimos 15, fiz 1.140.',
  description:
    'A aula em que eu abro o sistema de conteúdo com IA do desafio 100k: o painel por dentro, os bastidores dos posts que estouraram e as skills prontas. 2h20, dentro do Push Club.',
  alternates: { canonical: 'https://ia.augustogobatto.com/conteudo' },
  openGraph: {
    type: 'article',
    url: 'https://ia.augustogobatto.com/conteudo',
    title: 'Nos primeiros 25 dias fiz 17 seguidores. Nos últimos 15, fiz 1.140.',
    description:
      'A aula em que eu abro o sistema de conteúdo com IA do desafio 100k. 2h20, dentro do Push Club.',
    images: [{ url: '/conteudo/painel.webp', width: 1200, height: 731 }],
  },
}

const STRIPE_MENSAL = 'https://buy.stripe.com/5kQ00k91qeVL2ve9JG9fW0f'
const STRIPE_ANUAL = 'https://buy.stripe.com/9B628s4La14Vb1KaNK9fW0g'

function Print({ src, alt, legenda }: { src: string; alt: string; legenda?: string }) {
  return (
    <figure className="rc-print">
      <img src={src} alt={alt} loading="lazy" width={1200} height={731} />
      {legenda ? <figcaption>{legenda}</figcaption> : null}
    </figure>
  )
}

export default function ConteudoPage() {
  return (
    <div className="p7">
      <div className="p7-bar">
        <div className="p7-bar-in">
          <a href="/club" className="p7-mark">
            Push <em>Club</em>
          </a>
          <a href="#entrar" className="p7-pill rc-bar-cta">
            Quero ver a aula
          </a>
        </div>
      </div>

      {/* herói */}
      <section className="rc-hero">
        <div className="p7-wrap">
          <span className="p7-eyebrow">Aula do Push Club · ao vivo em 31/08 · 2h20</span>
          <h1 className="p7-h1">
            Nos primeiros 25 dias eu fiz 17 seguidores. <em>Nos últimos 15, fiz 1.140.</em>
          </h1>
          <p className="rc-sub">
            Mesmo Instagram, mesmo eu. No meio, um sistema de conteúdo com IA que eu construí em
            público, no desafio 100k. Na aula eu abri ele inteiro pro Club: o painel por dentro, o
            que fez cada post estourar, e as conversas com a IA que ninguém vê no feed.
          </p>
          <div className="rc-cta-row">
            <a href="#entrar" className="p7-pill big">Quero ver a aula</a>
            <span className="rc-cta-note">dentro do Club · R$70/mês · sem fidelidade</span>
          </div>

          <div className="rc-stats">
            <div>
              <span className="n">7.019</span>
              <span className="l">seguidores em 12/09. No dia 1 do desafio, 13/07, eram 5.422</span>
            </div>
            <div>
              <span className="n">300 mil</span>
              <span className="l">views na temporada, em 94 posts</span>
            </div>
            <div>
              <span className="n">70.504</span>
              <span className="l">views no reel mais visto, publicado 04/09</span>
            </div>
            <div>
              <span className="n">1.264</span>
              <span className="l">saves num post só, 547 comentários</span>
            </div>
          </div>
          <p className="rc-fonte">Números conferidos no painel do desafio em 12/09/2026.</p>
        </div>
      </section>

      {/* o painel */}
      <section className="rc-sec">
        <div className="p7-wrap">
          <span className="p7-eyebrow">O que eu construí</span>
          <h2 className="p7-h2">Um painel que faz o trabalho de uma equipe de conteúdo. Eu montei ele conversando com IA.</h2>
          <p className="rc-lead">
            A primeira coisa que eu construí no desafio foi o painel, não o conteúdo. Hoje ele
            coleta, analisa, me cobra e publica. Na aula eu abro ele de dentro, aba por aba, uns 30
            minutos só nisso.
          </p>

          <div className="rc-galeria">
            <Print src="/conteudo/painel.webp" alt="Placar do desafio 100k: dia 50 de 100, curva de seguidores" legenda="Placar · a curva de seguidores, atualizada sozinha todo dia" />
            <Print src="/conteudo/radar.webp" alt="Aba de referências do painel com perfis monitorados e virais ordenados por outlier" legenda="Radar · os reels que eu salvo entram no banco já analisados" />
            <Print src="/conteudo/placar-reels.webp" alt="Placar dos reels teste com nota de pauta e métricas por peça" legenda="Reels teste · cada pauta com nota antes de eu gravar" />
          </div>

          <ul className="rc-lista">
            <li><i>→</i><span><b>1.638 referências</b> garimpadas do Instagram, 222 delas com o hook e a tese de viralização já escritos pela IA. Eu só encaminho o reel pro meu próprio direct.</span></li>
            <li><i>→</i><span><b>155 ideias</b> faladas por áudio no Telegram, guardadas com hook, pilar e formato, sem eu abrir o notebook.</span></li>
            <li><i>→</i><span><b>Nota de viralização</b> em cada pauta antes de eu gravar. Abaixo da nota de corte, eu nem escrevo.</span></li>
            <li><i>→</i><span><b>Auto-crítica diária:</b> a IA assiste o meu reel do dia e devolve nota de 0 a 10, um acerto e uma melhoria. 64 avaliações até a aula.</span></li>
            <li><i>→</i><span><b>Agenda da semana</b> codificada no sistema, com o bot me cobrando na hora certa.</span></li>
            <li><i>→</i><span><b>Publicação de carrossel</b> direto do painel, e a conexão com a Meta que nunca expira.</span></li>
          </ul>
          <p className="rc-p ink" style={{ marginTop: 24 }}>
            Como cada peça foi feita, em que ordem, e o que eu faria diferente: está na aula.
          </p>
        </div>
      </section>

      {/* os segredos do que viralizou */}
      <section className="rc-sec">
        <div className="p7-wrap">
          <span className="p7-eyebrow">O que eu abri</span>
          <h2 className="p7-h2">Os bastidores dos posts que estouraram, com a conversa inteira na tela</h2>
          <p className="rc-lead">
            No feed você vê o resultado. Na aula eu mostro a conversa com a IA do começo ao fim, com
            as versões que eu reprovei e o momento em que virou.
          </p>

          <div className="rc-blocos">
            <div className="rc-bloco">
              <Print src="/conteudo/carrossel-48k.webp" alt="O carrossel de 48 mil views aberto no Instagram durante a aula" />
              <div>
                <span className="rc-bnum">01</span>
                <h3>O carrossel de 48 mil views, linha por linha</h3>
                <p>
                  A conversa de 06/08 sem cortar. As primeiras versões que eu reprovei, o áudio torto
                  que virou a virada, e a headline nascendo no meio. E por que eu quase abandonei o
                  formato no dia seguinte, quando ele tinha 3 mil views.
                </p>
              </div>
            </div>

            <div className="rc-bloco">
              <Print src="/conteudo/gravuras.webp" alt="As gravuras em preto e branco geradas por IA pro carrossel, lado a lado" />
              <div>
                <span className="rc-bnum">02</span>
                <h3>As artes que não têm cara de IA</h3>
                <p>
                  Como eu gero as gravuras do carrossel com IA, em rodadas, até ficar com a estética
                  que eu quero. As artes cruas ao lado das lâminas finais, e a única regra que eu
                  não quebro nunca.
                </p>
              </div>
            </div>

            <div className="rc-bloco">
              <Print src="/conteudo/trazendo-seguidor.webp" alt="A conversa que montou o fluxo do comentário à DM: 14 no fluxo, 5 versões do reel, +252 seguidores em 3 dias" />
              <div>
                <span className="rc-bnum">03</span>
                <h3>O reel que flopou e o conserto 48 horas depois</h3>
                <p>
                  Estreou com 123 views e zero comentário. Dois dias depois, a mesma gravação deu 5,5
                  vezes mais. O que mudou cabe em 4 segundos, e eu mostro os dois lado a lado.
                </p>
              </div>
            </div>

            <div className="rc-bloco">
              <Print src="/conteudo/dez-sistemas.webp" alt="A página '10 sistemas que você pode criar com Claude esse fim de semana' entregue por DM" />
              <div>
                <span className="rc-bnum">04</span>
                <h3>Cinco frases, o mesmo vídeo, e a palavra que separa 223 comentários de 15</h3>
                <p>
                  O lote de reels mudos de 28/08, o que virou a curva. Mesmo vídeo, mesma legenda,
                  só a frase na tela mudando. A campeã, a que canibalizou a irmã, e a expressão que
                  quase todo mundo usa e mata o comentário. Depois, o fluxo do comentário à DM: 184
                  comentaram, e o erro da API que quebra quem tenta repetir em casa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* as skills */}
      <section className="rc-sec">
        <div className="p7-wrap">
          <span className="p7-eyebrow">O que roda isso</span>
          <h2 className="p7-h2">Seis skills, prontas pra você instalar no seu Claude</h2>
          <p className="rc-lead">
            Skill é uma instrução salva que a IA carrega sozinha quando o assunto aparece. Quase
            todas nasceram de um erro meu, e cada história está na aula.
          </p>
          <ul className="rc-skills">
            <li><code>/filtro-schwartz</code><span>A nota que decide se eu escrevo ou não. Veio de um livro de 1966 que eu achei num reel.</span></li>
            <li><code>/planejar-conteudo</code><span>Abre o domingo com os números na mesa e escreve os roteiros comigo, não por mim.</span></li>
            <li><code>/reels-teste</code><span>O lote de reels do dia com uns 30 segundos meus por peça. Foi esse lote que virou a curva.</span></li>
            <li><code>/deslop</code><span>Tira a cara de IA sem trocar a minha voz por outra genérica. A que eu mais uso.</span></li>
            <li><code>/laele</code><span>Caça o que a plateia vai ler com segunda intenção, antes de eu postar. Achou 8 onde eu tinha visto 1.</span></li>
            <li><code>/gloop</code><span>Um crítico cego por rodada, tentando provar que a peça está quebrada. Roda até parar de sangrar.</span></li>
          </ul>
        </div>
      </section>

      {/* antes de qualquer coisa */}
      <section className="rc-sec">
        <div className="p7-wrap">
          <span className="p7-eyebrow">Pra ser honesto</span>
          <h2 className="p7-h2">Três coisas que eu falei antes de abrir a tela</h2>
          <ul className="rc-lista">
            <li><i>1</i><span><b>Não é maquininha de fazer conteúdo automático.</b> Não dá pra automatizar um processo que ainda não existe. Eu tive que testar muito antes.</span></li>
            <li><i>2</i><span><b>Piorou meu tempo de tela.</b> Fico ansioso olhando número. Aceitei essa conta de olho no longo prazo.</span></li>
            <li><i>3</i><span><b>É pra quem quer fazer com a própria mão.</b> Se você quer terceirizar pra uma agência, a aula não é pra você.</span></li>
          </ul>

          <div className="p7-faq">
            <details>
              <summary>Não tenho VPS nem painel. Serve pra mim?</summary>
              <p>
                Serve. O último bloco da aula é a versão sem servidor nenhum, com pasta de salvos e
                qualquer chat de IA. As skills rodam no Claude direto. O painel é o degrau de cima,
                e o curso que ensina a construir está no Club.
              </p>
            </details>
            <details>
              <summary>Não sei programar.</summary>
              <p>
                Eu também não sabia direito. Tudo que aparece na aula foi construído conversando com
                o Claude, e a parte que exige código tem curso próprio dentro do Club.
              </p>
            </details>
            <details>
              <summary>Vai sair tudo com cara de IA?</summary>
              <p>
                Tem um bloco inteiro só sobre isso, e uma skill que acha o padrão de IA no texto e
                aponta a linha. Ela achou 37 no próprio deck da aula, escritos por mim sem perceber.
              </p>
            </details>
            <details>
              <summary>Não tenho tempo pra produzir.</summary>
              <p>
                Ninguém tem. Por isso a aula começa pela agenda: quantas peças por semana, em que
                hora, e quanto do meu tempo cada uma custa de verdade.
              </p>
            </details>
            <details>
              <summary>E se eu entrar e não gostar?</summary>
              <p>
                Cancela em dois cliques. Nos primeiros 7 dias a lei devolve o dinheiro (art. 49 do
                CDC). Depois disso, R$70 não é risco: você fica um mês, assiste, instala as skills e
                decide.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* o que você leva */}
      <section className="rc-sec">
        <div className="p7-wrap">
          <span className="p7-eyebrow">O que você leva</span>
          <h2 className="p7-h2">A aula, o material dela, e o resto do Club junto</h2>
          <ul className="rc-dentro">
            <li><i>→</i><span><b>A aula completa</b>, 2h20, com o deck de 32 slides e as notas de apresentador</span></li>
            <li><i>→</i><span><b>Anatomia do carrossel de 48 mil</b>: a conversa inteira de 06/08 e as 24 artes</span></li>
            <li><i>→</i><span><b>Anatomia do reel + CEQ</b>: a conversa de 28/08 que montou o fluxo do comentário à DM</span></li>
            <li><i>→</i><span><b>12 skills prontas na aba Skills</b>, as 6 da aula entre elas. Copia, cola no seu Claude e usa.</span></li>
            <li><i>→</i><span><b>comenta EU QUERO</b>, a ferramenta do fluxo comentário → DM, sua, sem mensalidade</span></li>
            <li><i>→</i><span><b>IA Fundamentos</b>, <b>Vibecode</b> (criar qualquer sistema do zero) e a <b>Oficina Claude Code</b></span></li>
            <li><i>→</i><span><b>Encontro ao vivo todo mês</b>, Raio-X do seu negócio, Claudinei 24/7 e o grupo</span></li>
          </ul>
        </div>
      </section>

      {/* pitch */}
      <section className="rc-pitch p7-centro" id="entrar">
        <div className="p7-wrap">
          <span className="p7-eyebrow">Onde a aula mora</span>
          <h2 className="p7-h2">Entra por R$70, assiste a aula, instala as skills</h2>
          <p className="p7-dim" style={{ marginTop: 18, maxWidth: '54ch' }}>
            Acesso na hora, sem fidelidade. Se em 7 dias achar que não valeu, cancela e a lei
            devolve.
          </p>

          <div className="p7-plans">
            <div className="p7-plan">
              <span className="name">mensal</span>
              <div className="price">R$70<small>/mês</small></div>
              <span className="eq">sem fidelidade, fica um mês se quiser</span>
              <ul>
                <li>A aula, o deck e as duas anatomias</li>
                <li>As 12 skills prontas</li>
                <li>Todos os cursos e workshops do Club</li>
              </ul>
              <a href={STRIPE_MENSAL} className="p7-pill ghost" data-checkout="mensal">Quero entrar por R$70</a>
            </div>
            <div className="p7-plan hot">
              <span className="p7-badge">vale mais a pena · 2 meses grátis</span>
              <span className="name">anual</span>
              <div className="price">R$600<small>/ano</small></div>
              <span className="eq">= R$50/mês · economia de R$240</span>
              <ul>
                <li>Tudo do plano mensal</li>
                <li>Uma cobrança só no ano</li>
                <li>Prioridade nas turmas ao vivo</li>
              </ul>
              <a href={STRIPE_ANUAL} className="p7-pill" data-checkout="anual">Quero o anual: R$50/mês</a>
            </div>
          </div>

          <p className="p7-fine" style={{ marginLeft: 'auto', marginRight: 'auto', marginBottom: 6 }}>
            acesso imediato, cancela quando quiser
          </p>
          <p className="p7-fine" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
            Sem garantia teatral de 30 dias. Você tem os 7 dias de arrependimento que a lei dá, e
            depois disso R$70 não é risco: cancelar são dois cliques.
          </p>
          <p className="rc-membro">
            Já é membro? A aula está em <a href="/members">Aulas Soltas</a> e as skills na aba{' '}
            <a href="/members/skills">Skills</a>.
          </p>
        </div>
      </section>

      <footer className="p7-footer" style={{ marginTop: 72 }}>
        <div className="p7-footer-in">
          <span>© {new Date().getFullYear()} Augusto Gobatto</span>
          <span>cancelamento em 2 cliques · 7 dias de arrependimento (art. 49, CDC)</span>
          <a href="/privacidade">privacidade</a>
        </div>
      </footer>

      <RastreioConteudo />
    </div>
  )
}
