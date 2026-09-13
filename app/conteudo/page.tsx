import type { Metadata } from 'next'
import RastreioConteudo from './RastreioConteudo'
import '../(marketing)/club/v7.css'
import './conteudo.css'

/**
 * /conteudo — resumão da aula ao vivo "Produção de Conteúdo com IA" (31/08/2026),
 * feito pra link de stories. Números conferidos no Supabase do desafio em 31/08
 * 10h15 (os mesmos do deck da aula). Pitch no fim com os dois planos do Club.
 *
 * Regras herdadas da /aula e da /club: zero escassez, rastreio pelo contrato
 * único (lib/rastreio.ts), rodapé legal fora de qualquer trava.
 */
export const metadata: Metadata = {
  title: 'Como eu uso IA pra produzir meu conteúdo — resumo da aula',
  description:
    'Nos primeiros 25 dias fiz 17 seguidores. Nos últimos 3, fiz 252. O sistema em 5 peças, as 6 skills e o que os números ensinaram. Resumo da aula ao vivo do Push Club.',
  alternates: { canonical: 'https://ia.augustogobatto.com/conteudo' },
  openGraph: {
    type: 'article',
    url: 'https://ia.augustogobatto.com/conteudo',
    title: 'Como eu uso IA pra produzir meu conteúdo',
    description:
      'Nos primeiros 25 dias fiz 17 seguidores. Nos últimos 3, fiz 252. O sistema em 5 peças, as 6 skills e o que os números ensinaram.',
    images: [{ url: '/club-v7/og.jpg', width: 1200, height: 630 }],
  },
}

const STRIPE_MENSAL = 'https://buy.stripe.com/5kQ00k91qeVL2ve9JG9fW0f'
const STRIPE_ANUAL = 'https://buy.stripe.com/9B628s4La14Vb1KaNK9fW0g'

export default function ConteudoPage() {
  return (
    <div className="p7">
      <div className="p7-bar">
        <div className="p7-bar-in">
          <a href="/club" className="p7-mark">
            Push <em>Club</em>
          </a>
          <a href="#entrar" className="p7-pill rc-bar-cta">
            Entrar no Club
          </a>
        </div>
      </div>

      {/* herói */}
      <section className="rc-hero">
        <div className="p7-wrap">
          <span className="p7-eyebrow">Resumo da aula ao vivo · 31/08 · 2h20</span>
          <h1 className="p7-h1">Como eu uso IA pra produzir meu conteúdo</h1>
          <p className="rc-sub">
            <b>Nos primeiros 25 dias do desafio eu fiz 17 seguidores. Nos últimos 3, fiz 252.</b>{' '}
            Isso aqui é o que mudou no meio, resumido em três páginas. A aula inteira, com as telas
            abertas, está dentro do Club.
          </p>

          <div className="rc-stats">
            <div>
              <span className="n">155.000</span>
              <span className="l">views na temporada, em 66 posts</span>
            </div>
            <div>
              <span className="n">48.471</span>
              <span className="l">views no carrossel que estourou</span>
            </div>
            <div>
              <span className="n">+709</span>
              <span className="l">seguidores na temporada (5.422 → 6.131)</span>
            </div>
            <div>
              <span className="n">1.211</span>
              <span className="l">saves num post só, 1.047 compartilhamentos</span>
            </div>
          </div>
        </div>
      </section>

      {/* antes de qualquer coisa técnica */}
      <section className="rc-sec">
        <div className="p7-wrap">
          <span className="p7-eyebrow">Antes de qualquer coisa técnica</span>
          <h2 className="p7-h2">Três coisas que eu falei antes de abrir a tela</h2>
          <ul className="rc-lista">
            <li>
              <i>1</i>
              <span>
                <b>Não é maquininha de conteúdo automático.</b> Não dá pra automatizar um processo
                que ainda não existe. Comecei do zero, sem saber o que eu gostava de fazer nem o que
                dava certo pra mim. Tive que testar.
              </span>
            </li>
            <li>
              <i>2</i>
              <span>
                <b>Piorou meu tempo de tela.</b> Tive que consumir muito conteúdo pra entender o jogo,
                e fico ansioso olhando número. Aceitei essa conta de olho no longo prazo.
              </span>
            </li>
            <li>
              <i>3</i>
              <span>
                <b>A primeira coisa que construí foi o painel, não o conteúdo.</b> Métrica na tela e
                sensação de crescimento. Sem isso eu não teria passado dos 25 dias de +17.
              </span>
            </li>
          </ul>

          <p className="rc-p" style={{ marginTop: 28 }}>
            E quatro regras que sustentam o resto: <b>desafio público</b> (depois que você anuncia,
            fica feio desistir, e isso não tem uma linha de código), <b>eu faço, não terceirizo</b>{' '}
            (nem agência, nem editor), <b>só o que me empolga</b> (senão morre na semana 3) e{' '}
            <b>o painel antes de qualquer post</b>.
          </p>
        </div>
      </section>

      {/* o sistema em 5 peças */}
      <section className="rc-sec">
        <div className="p7-wrap">
          <span className="p7-eyebrow">O sistema</span>
          <h2 className="p7-h2">Cinco peças, na ordem em que eu uso</h2>
          <p className="rc-lead">
            Next.js na Vercel, Supabase e uma VPS. Todo dado tem dois caminhos: um cron e um botão.
            A stack é a parte fácil de copiar. O que segura o resultado é o que roda em cima dela.
          </p>

          <div style={{ marginTop: 34 }}>
            <div className="rc-passo">
              <span className="num">01</span>
              <div>
                <h3>O radar: de onde vem a pauta boa</h3>
                <p>
                  Vem do que já viralizou. Encaminho o reel pro meu próprio direct e o direct vira
                  banco: um script pega o link, raspa os números, transcreve, e o Claude escreve o
                  hook e a tese de viralização.
                </p>
                <p>
                  O número que importa é o <b>outlier</b>: plays dividido pela mediana do perfil. Um
                  reel de 30 mil num perfil que faz 2 mil vale mais que 100 mil num perfil de 1
                  milhão. Hoje são 1.638 referências, 222 analisadas, maior outlier 73,8x.
                </p>
              </div>
            </div>

            <div className="rc-passo">
              <span className="num">02</span>
              <div>
                <h3>O filtro: três perguntas antes de escrever</h3>
                <p>
                  Toda pauta passa pelo Schwartz (<i>Breakthrough Advertising</i>, 1966). Nota de 1
                  a 5 em cada: <b>quanto dói? volta sempre? quanta gente sente?</b> Abaixo de 12 em
                  15, eu não escrevo. &ldquo;10 sistemas&rdquo; tirou 13 e foi produzido.
                  &ldquo;Ganho 35 mil da Anthropic&rdquo; tirou 7 e foi vetada, nichada demais.
                </p>
                <p className="frase">
                  Você não faz alguém querer uma coisa. Você acha o que já querem e fica na frente.
                </p>
                <p>
                  Hook bom não salva pauta ruim: se o desejo não está lá, a primeira frase esperta
                  só te dá uma fatia maior de nada. E a pauta sobre mim mesmo (&ldquo;olha meu
                  sistema&rdquo;, nota 8) foi a pior da semana.
                </p>
              </div>
            </div>

            <div className="rc-passo">
              <span className="num">03</span>
              <div>
                <h3>A agenda: ninguém produz conteúdo sem ter tempo</h3>
                <p>2 reels + 1 carrossel por semana, com hora marcada. O bot me cobra.</p>
                <ul className="rc-agenda">
                  <li><b>Dom</b><span>9h30</span>planejar, escrever 3 roteiros, gravar</li>
                  <li><b>Seg</b><span>9h</span>editar · postar reel 1 · programar reel 2</li>
                  <li><b>Ter</b><span>9h15</span>carrossel: criar e programar</li>
                  <li><b>Qua</b><span>12h</span>reel 2 sai sozinho</li>
                  <li><b>Qui</b><span>12h</span>carrossel sai · placar às 18h</li>
                </ul>
                <p style={{ marginTop: 14 }}>
                  Ideia eu falo por áudio no Telegram; o bot transcreve e guarda com hook, pilar e
                  formato. 155 ideias na fila. Regra: <b>não deixar ideia morrer no transporte</b>.
                  Se depender de eu abrir o notebook, morre.
                </p>
                <p>
                  As primeiras semanas doem. Da terceira em diante você vê pauta em conversa de bar,
                  e não foi ferramenta nenhuma que fez isso.
                </p>
              </div>
            </div>

            <div className="rc-passo">
              <span className="num">04</span>
              <div>
                <h3>A voz: a ideia é minha, a lapidação é com IA</h3>
                <p>
                  Tenho um VOZ.md com os padrões de IA proibidos: o &ldquo;não é X, é Y&rdquo;, a
                  tríade, a frase de outdoor, o fecho motivacional. Cada um com um exemplo real
                  reprovado e datado.
                </p>
                <p>
                  Frase na minha voz se garimpa nos meus próprios reels transcritos. Não se inventa.
                  O teste rápido: <b>eu falaria isso num áudio de WhatsApp?</b>
                </p>
              </div>
            </div>

            <div className="rc-passo">
              <span className="num">05</span>
              <div>
                <h3>A revisão em camadas: cara de IA, duplo sentido, argumento</h3>
                <p>
                  Aprovado não é publicado. Antes de sair, o texto passa por três varreduras
                  separadas, e toda correção que aparece duas vezes vira regra escrita. Processo bom
                  vira sistema, não memória.
                </p>
                <p>
                  Recibo honesto: a varredura achou 37 travessões e cinco &ldquo;não é X, é Y&rdquo;
                  no próprio deck da aula, escritos por mim sem perceber. A régua vale pro meu texto
                  também.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* o que os números ensinaram */}
      <section className="rc-sec">
        <div className="p7-wrap">
          <span className="p7-eyebrow">O que os números me ensinaram</span>
          <h2 className="p7-h2">Três lições que eu não acreditaria sem a tabela</h2>

          <div style={{ marginTop: 34 }}>
            <div className="rc-passo">
              <span className="num">A</span>
              <div>
                <h3>Nunca julgue formato em 24 horas</h3>
                <table className="rc-tab">
                  <thead>
                    <tr><th>Post</th><th className="n">Em 24h</th><th className="n">Hoje</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>O carrossel que estourou (06/08)</td><td className="n">3.110</td><td className="n">48.471</td></tr>
                    <tr><td>Dâmocles (27/08), lido como flop</td><td className="n">858</td><td className="n">4.541</td></tr>
                  </tbody>
                </table>
                <p>
                  No dia seguinte a recomendação era abandonar o formato. Discordei. Carrossel de
                  tese circula por save e DM, não por pico de feed. Por isso a cauda é longa.
                </p>
              </div>
            </div>

            <div className="rc-passo">
              <span className="num">B</span>
              <div>
                <h3>Pauta boa não salva abertura ruim</h3>
                <p>
                  Um reel com pauta 14/15 no filtro estreou com <b>123 views, zero comentário</b>. O
                  problema eram os 4 primeiros segundos: plano parado no escuro, promessa só aos 6
                  segundos, gordura do take.
                </p>
                <table className="rc-tab">
                  <thead>
                    <tr><th>Mesmo vídeo, 48h depois</th><th className="n">Views</th><th className="n">Coment.</th></tr>
                  </thead>
                  <tbody>
                    <tr className="hot"><td>Cold open no número + legenda pela dor</td><td className="n">681</td><td className="n">16</td></tr>
                    <tr><td>Hook original</td><td className="n">124</td><td className="n">1</td></tr>
                    <tr><td>Terceira variante</td><td className="n">125</td><td className="n">0</td></tr>
                  </tbody>
                </table>
                <p>Mesmo corpo, mesma gravação, mesmo CTA. Só a abertura e a legenda mudaram: 5,5x.</p>
              </div>
            </div>

            <div className="rc-passo">
              <span className="num">C</span>
              <div>
                <h3>Copy vence fundo</h3>
                <p>
                  O lote de reels teste de 28/08, responsável pelos +252 seguidores. Mesmo vídeo
                  mudo, só a frase na tela mudando:
                </p>
                <table className="rc-tab">
                  <thead>
                    <tr><th>Texto na tela</th><th className="n">Views</th><th className="n">Coment.</th></tr>
                  </thead>
                  <tbody>
                    <tr className="hot"><td>&ldquo;Em vez de maratonar Netflix… um desses 10 sistemas&rdquo;</td><td className="n">6.270</td><td className="n">223</td></tr>
                    <tr><td>idem, com &ldquo;rolar feed&rdquo;</td><td className="n">3.570</td><td className="n">77</td></tr>
                    <tr><td>mesma copy, fundo diferente</td><td className="n">3.048</td><td className="n">88</td></tr>
                    <tr><td>&ldquo;Troque rolar o feed por construir sistema&rdquo;</td><td className="n">2.181</td><td className="n">15</td></tr>
                  </tbody>
                </table>
                <p>
                  Sem o &ldquo;um desses 10&rdquo; some o gap de curiosidade e o comentário
                  despenca de 223 pra 15. <b>&ldquo;Troque X por Y&rdquo; mata o comentário.</b> E a
                  copy campeã num fundo novo, no mesmo dia, ficou 50% abaixo: canibalizou o irmão.
                </p>
                <p>
                  Do outro lado do comentário: 184 pessoas comentaram &ldquo;sistema&rdquo;, 42%
                  clicaram no botão da DM, 67 chegaram no link. Comentário não abre a janela da API.
                  O clique abre.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* as skills */}
      <section className="rc-sec">
        <div className="p7-wrap">
          <span className="p7-eyebrow">As skills</span>
          <h2 className="p7-h2">Skill é uma instrução salva. A IA carrega sozinha quando o assunto aparece.</h2>
          <p className="rc-lead">
            Sem skill, você repete a mesma explicação toda vez que abre uma conversa nova. Com skill,
            a regra fica escrita e passa a valer sempre. <b>Quase todas nasceram de um erro meu.</b>{' '}
            Seis, na ordem em que eu uso:
          </p>
          <ul className="rc-skills">
            <li><code>/filtro-schwartz</code><span>As três perguntas, nota e corte. Roda em toda pauta. Veio de um reel que eu puxei, transcrevi e virei regra.</span></li>
            <li><code>/planejar-conteudo</code><span>Abre o domingo com os números na mesa, puxa as referências que viralizaram e escreve os roteiros comigo, não por mim.</span></li>
            <li><code>/reels-teste</code><span>Produz o lote do dia sozinha: fundo, texto na tela, render. Uns 30 segundos do meu tempo por peça. Foi esse lote que fez os +252.</span></li>
            <li><code>/deslop</code><span>Tira a cara de IA do texto sem trocar a minha voz por outra genérica. A que eu mais uso.</span></li>
            <li><code>/laele</code><span>Caça duplo sentido antes de publicar. Achou 8 onde eu tinha visto 1.</span></li>
            <li><code>/gloop</code><span>Um crítico novo e cego por rodada, com a tarefa de provar que está quebrado. Roda até parar de sangrar.</span></li>
          </ul>
          <p className="rc-p" style={{ marginTop: 22 }}>
            O contra-exemplo honesto: o carrossel do gestor de tráfego passou por quatro rodadas de
            crítica, corrigiu erro factual de verdade, e mesmo assim flopou.{' '}
            <b>O sistema não garante acerto. Garante que o erro não se repete.</b>
          </p>
        </div>
      </section>

      {/* pra quem não tem VPS */}
      <section className="rc-sec">
        <div className="p7-wrap">
          <span className="p7-eyebrow">Pra quem não tem VPS nenhuma</span>
          <h2 className="p7-h2">A escada, sem nada do que eu mostrei</h2>
          <ul className="rc-lista">
            <li><i>1</i><span><b>Salve referência num lugar só</b> e analise o porquê de cada uma. Pasta de salvos do Instagram + qualquer chat de IA resolve.</span></li>
            <li><i>2</i><span><b>Passe toda pauta pelas três perguntas.</b> Dói, volta sempre, quanta gente sente. Qualquer IA roda.</span></li>
            <li><i>3</i><span><b>Escreva teu documento de voz.</b> Grave 5 áudios seus, transcreva, extraia teus padrões proibidos e permitidos.</span></li>
            <li><i>4</i><span><b>Revise em camadas antes de publicar.</b> Cara de IA, depois duplo sentido, depois argumento. E uma leitura fria dos números por semana: a IA lê, você decide.</span></li>
            <li><i>5</i><span><b>Toda correção vira regra escrita.</b> É o degrau que faz o sistema melhorar em vez de repetir erro.</span></li>
            <li><i>6</i><span><b>Quando a regra provou que funciona, ela vira skill</b> e passa a rodar sozinha.</span></li>
          </ul>
        </div>
      </section>

      {/* pitch */}
      <section className="rc-pitch p7-centro" id="entrar">
        <div className="p7-wrap">
          <span className="p7-eyebrow">Onde isso mora</span>
          <h2 className="p7-h2">A aula inteira e as skills prontas estão no Club</h2>
          <p className="p7-dim" style={{ marginTop: 18, maxWidth: '58ch' }}>
            Esta página é o resumo. A aula são 2h20 com as telas abertas: o painel por dentro, a
            conversa que virou o carrossel de 48 mil, o reel do roteiro ao corte, o fluxo do
            comentário à DM. E as 6 skills de cima já adaptadas, prontas pra instalar no seu Claude.
          </p>

          <ul className="rc-dentro" style={{ marginLeft: 'auto', marginRight: 'auto', textAlign: 'left' }}>
            <li><i>→</i><span><b>Produção de Conteúdo com IA</b>, a aula completa, com o deck e as duas anatomias (carrossel e reel)</span></li>
            <li><i>→</i><span><b>12 skills na aba Skills</b>, as 6 desta página entre elas, pra copiar e usar</span></li>
            <li><i>→</i><span><b>IA Fundamentos</b>, <b>Vibecode</b> (criar qualquer sistema do zero) e a <b>Oficina Claude Code</b></span></li>
            <li><i>→</i><span><b>comenta EU QUERO</b>, a ferramenta do fluxo comentário → DM, sua, sem mensalidade</span></li>
            <li><i>→</i><span><b>Encontro ao vivo todo mês</b>, Raio-X do seu negócio, Claudinei 24/7 e o grupo</span></li>
          </ul>

          <div className="p7-plans">
            <div className="p7-plan">
              <span className="name">mensal</span>
              <div className="price">R$70<small>/mês</small></div>
              <span className="eq">sem fidelidade, fica um mês se quiser</span>
              <ul>
                <li>Tudo da lista acima</li>
                <li>Acesso imediato</li>
                <li>Cancela em dois cliques</li>
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
