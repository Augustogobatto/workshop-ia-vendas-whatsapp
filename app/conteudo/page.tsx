import type { Metadata } from 'next'
import RastreioConteudo from './RastreioConteudo'
import '../(marketing)/club/v7.css'
import './conteudo.css'

/**
 * /conteudo, página de venda da aula "Produção de Conteúdo com IA" (ao vivo,
 * 31/08/2026, 2h20) e, por ela, do Push Club. Feita pra link de stories.
 *
 * Desenho (pedido dele em 13/09): a página dá "a fatia de queijo" (três lições
 * com número, dá pra usar hoje) e vende o queijo inteiro (a aula com as telas
 * abertas + as skills prontas). Prints são frames da própria gravação, cortados
 * na área da tela compartilhada (sem os alunos).
 *
 * Números: seguidores e posts conferidos no Supabase do desafio em 12/09/2026
 * (snapshot de 12/09). Os números das lições são os do deck da aula (31/08).
 *
 * Regras herdadas da /aula e da /club: zero escassez, rastreio pelo contrato
 * único (lib/rastreio.ts), rodapé legal fora de qualquer trava, sem "não é X,
 * é Y" (VOZ.md), sem travessão.
 */
export const metadata: Metadata = {
  title: 'Nos primeiros 25 dias fiz 17 seguidores. Nos últimos 15, fiz 1.140.',
  description:
    'A aula em que eu abro o sistema de conteúdo com IA do desafio 100k, com as telas abertas: painel, radar de referências, filtro de pauta, o post de 48 mil views linha por linha, e as skills prontas. 2h20, dentro do Push Club.',
  alternates: { canonical: 'https://ia.augustogobatto.com/conteudo' },
  openGraph: {
    type: 'article',
    url: 'https://ia.augustogobatto.com/conteudo',
    title: 'Nos primeiros 25 dias fiz 17 seguidores. Nos últimos 15, fiz 1.140.',
    description:
      'A aula em que eu abro o sistema de conteúdo com IA do desafio 100k, com as telas abertas. 2h20, dentro do Push Club.',
    images: [{ url: '/conteudo/painel.webp', width: 1200, height: 731 }],
  },
}

const STRIPE_MENSAL = 'https://buy.stripe.com/5kQ00k91qeVL2ve9JG9fW0f'
const STRIPE_ANUAL = 'https://buy.stripe.com/9B628s4La14Vb1KaNK9fW0g'

function Print({ src, alt, legenda }: { src: string; alt: string; legenda: string }) {
  return (
    <figure className="rc-print">
      <img src={src} alt={alt} loading="lazy" width={1200} height={731} />
      <figcaption>{legenda}</figcaption>
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
            Mesmo Instagram, mesmo eu. O que mudou no meio foi um sistema de conteúdo
            com IA que eu montei em público, no desafio 100k. Nessa aula eu abri ele inteiro pra
            galera do Club, com as telas abertas: o painel, o radar, a conversa que virou o post de
            48 mil views, o reel que flopou e o conserto 48 horas depois.
          </p>
          <div className="rc-cta-row">
            <a href="#entrar" className="p7-pill big">Quero ver a aula</a>
            <span className="rc-cta-note">dentro do Club · R$70/mês · sem fidelidade</span>
          </div>

          <Print
            src="/conteudo/painel.webp"
            alt="Painel do desafio 100k mostrado na aula: dia 50 de 100, curva de seguidores subindo"
            legenda="O painel do desafio, aberto ao vivo na aula (dia 50 de 100). A curva é a de seguidores."
          />

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
              <span className="l">views no reel mais visto (&ldquo;Um final de semana tem 48 horas&rdquo;, 04/09)</span>
            </div>
            <div>
              <span className="n">1.264</span>
              <span className="l">saves num post só, 547 comentários</span>
            </div>
          </div>
          <p className="rc-fonte">Números conferidos no painel do desafio em 12/09/2026.</p>
        </div>
      </section>

      {/* antes de qualquer coisa */}
      <section className="rc-sec">
        <div className="p7-wrap">
          <span className="p7-eyebrow">Antes de qualquer coisa</span>
          <h2 className="p7-h2">Três coisas que eu falei antes de abrir a tela, e valem aqui também</h2>
          <ul className="rc-lista">
            <li>
              <i>1</i>
              <span>
                <b>Isso aqui não é maquininha de fazer conteúdo automático.</b> Não dá pra automatizar
                um processo que ainda não existe. Eu comecei do zero, sem saber o que eu gostava de
                fazer nem o que dava certo pra mim. Tive que testar muito.
              </span>
            </li>
            <li>
              <i>2</i>
              <span>
                <b>Piorou meu tempo de tela.</b> Tive que consumir muito conteúdo pra entender o jogo,
                e eu fico ansioso olhando número. Aceitei essa conta de olho no longo prazo.
              </span>
            </li>
            <li>
              <i>3</i>
              <span>
                <b>A primeira coisa que eu construí foi o painel, não o conteúdo.</b> Métrica na tela e
                sensação de crescimento. Sem isso eu não teria passado dos 25 dias de +17.
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* a fatia: 3 lições com número */}
      <section className="rc-sec">
        <div className="p7-wrap">
          <span className="p7-eyebrow">A fatia</span>
          <h2 className="p7-h2">Três coisas que eu não acreditaria sem a tabela. Essas eu te dou aqui mesmo.</h2>
          <p className="rc-lead">
            Dá pra usar hoje, sem sistema nenhum. Cada uma dessas eu aprendi errando na frente de todo
            mundo, com o número na tela.
          </p>

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
                    <tr><td>O carrossel que estourou (06/08), views</td><td className="n">3.110</td><td className="n">48.591</td></tr>
                    <tr><td>Dâmocles (27/08), lido como flop no dia seguinte (alcance)</td><td className="n">858</td><td className="n">11.295</td></tr>
                  </tbody>
                </table>
                <p>
                  No dia seguinte a recomendação, inclusive da IA, era abandonar o formato. Eu
                  discordei e tava certo. Carrossel de tese circula por save e DM, e por isso a cauda
                  é longa. Na aula eu mostro o post, a leitura errada de 24h e o que eu olhei pra
                  não seguir ela.
                </p>
              </div>
            </div>

            <div className="rc-passo">
              <span className="num">B</span>
              <div>
                <h3>Pauta boa não salva abertura ruim</h3>
                <p>
                  Um reel com a melhor nota de pauta da semana (14 de 15) estreou com <b>123 views e
                  zero comentário</b>. O problema eram os 4 primeiros segundos: plano parado no
                  escuro, promessa só aos 6 segundos, gordura do take.
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
                <p>
                  Mesmo corpo, mesma gravação, mesmo CTA. Só a abertura e a legenda mudaram, e deu
                  5,5x. O roteiro com marcação de câmera e os cinco cortes por timecode estão no
                  bloco 6 da aula, lado a lado.
                </p>
              </div>
            </div>

            <div className="rc-passo">
              <span className="num">C</span>
              <div>
                <h3>Copy vence fundo</h3>
                <p>
                  O lote de reels teste de 28/08, o que fez +252 seguidores em 3 dias. Mesmo vídeo
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
                  Tira o &ldquo;um desses 10&rdquo; e some o gap de curiosidade: o comentário despenca
                  de 223 pra 15. E a copy campeã num fundo novo, no mesmo dia, ficou 50% abaixo,
                  porque canibalizou o irmão. A gramática inteira desse formato, decodificada de duas
                  referências que eu salvei, está no bloco 7.
                </p>
              </div>
            </div>
          </div>

          <p className="rc-queijo">
            Isso é a fatia de queijo que te dão no mercado. O queijo inteiro é o que vem abaixo.
          </p>
        </div>
      </section>

      {/* o queijo: o que tem na aula */}
      <section className="rc-sec">
        <div className="p7-wrap">
          <span className="p7-eyebrow">O que tem na aula</span>
          <h2 className="p7-h2">Oito blocos, com a tela aberta em todos</h2>
          <p className="rc-lead">
            Formato misto: câmera pra abrir e fechar, tela no meio. Tudo que eu mostro é o que eu
            uso, no dia que eu usei, com o número real do lado.
          </p>

          <div className="rc-blocos">
            <div className="rc-bloco">
              <Print src="/conteudo/curva.webp" alt="Slide da aula: +17 nos primeiros 25 dias, +252 nos últimos 3, com o gráfico de barras dos seguidores por dia" legenda="Bloco 1 · a curva, dia a dia" />
              <div>
                <span className="rc-bnum">01</span>
                <h3>A curva e as quatro regras</h3>
                <p>
                  Por que os primeiros 25 dias deram +17 e o que aconteceu depois. Desafio público (a
                  trava é emocional, fica feio desistir), eu faço e não terceirizo, só o que me
                  empolga, e o painel antes de qualquer post.
                </p>
              </div>
            </div>

            <div className="rc-bloco">
              <Print src="/conteudo/radar.webp" alt="Tela do painel com perfis monitorados e a lista de virais por outlier: 1.112.122 plays, 23,5x a mediana" legenda="Bloco 3 · o radar: outlier = plays ÷ mediana do perfil" />
              <div>
                <span className="rc-bnum">02</span>
                <h3>O painel por dentro, uns 30 minutos</h3>
                <p>
                  Next.js, Supabase e uma VPS. A conexão com a Meta passo a passo: conta Business, app
                  no developers, o token de System User que não expira, e por que eu uso dois apps
                  (um só lê, o outro publica). Apify pra ver os outros, sempre post avulso, nunca
                  perfil inteiro. E o radar: eu encaminho o reel pro meu próprio direct e ele vira
                  banco, com hook e tese de viralização escritos pelo Claude. 1.638 referências,
                  maior outlier 73,8x.
                </p>
              </div>
            </div>

            <div className="rc-bloco">
              <Print src="/conteudo/placar-reels.webp" alt="Placar dos reels teste com nota do filtro, views e taxas por peça" legenda="Bloco 4 · o placar dos reels teste, com a nota do filtro em cada pauta" />
              <div>
                <span className="rc-bnum">03</span>
                <h3>O processo da semana</h3>
                <p>
                  Ideia por áudio no Telegram (155 na fila), a agenda com hora marcada que o bot me
                  cobra, o filtro de pauta com as três perguntas do Schwartz (abaixo de 12 em 15 eu
                  não escrevo), o documento de voz com os padrões de IA proibidos, e a descoberta de
                  formato. Depois, as seis skills, uma por vez: filtro-schwartz, planejar-conteudo,
                  reels-teste, deslop, laele, gloop.
                </p>
              </div>
            </div>

            <div className="rc-bloco">
              <Print src="/conteudo/carrossel-48k.webp" alt="O carrossel 'Ninguém mais assiste curso?' aberto no Instagram durante a aula" legenda="Bloco 5 · o post que estourou: 48 mil views, 1.213 saves" />
              <div>
                <span className="rc-bnum">04</span>
                <h3>O post que estourou, linha por linha</h3>
                <p>
                  A conversa inteira de 06/08 com o Claude, sem cortar. As primeiras versões que eu
                  reprovei (&ldquo;não tá viralizável&rdquo;, &ldquo;as imagens ficaram meio
                  genericão&rdquo;), o áudio torto que virou a virada, a headline nascendo no meio, a
                  prova com dado próprio e a ressalva honesta dentro do post. A IA não acertou de
                  primeira. Eu supervisionei até acertar.
                </p>
              </div>
            </div>

            <div className="rc-bloco">
              <Print src="/conteudo/gravuras.webp" alt="As gravuras em preto e branco geradas pra o carrossel, estilo Doré, lado a lado" legenda="Bloco 5 · as artes cruas ao lado das lâminas finais" />
              <div>
                <span className="rc-bnum">05</span>
                <h3>Por que explodiu</h3>
                <p>
                  Ameaça o formato, nunca a pessoa. Número próprio com ressalva. Enumeração concreta
                  sem adjetivo. E a capa que faz o leitor concluir sozinho. Gravuras no Higgsfield em
                  várias rodadas, e a regra dura: tipografia nunca na IA de imagem.
                </p>
              </div>
            </div>

            <div className="rc-bloco">
              <Print src="/conteudo/frase-mudando.webp" alt="Slide 'Só a frase mudando' com a tabela de copy, views e comentários" legenda="Bloco 7 · só a frase mudando: de 6.270 views a 2.181" />
              <div>
                <span className="rc-bnum">06</span>
                <h3>Um reel do roteiro ao fim, e o lote que trouxe os seguidores</h3>
                <p>
                  O reel que flopou com 123 views e o conserto 48 horas depois. Depois o lote de
                  28/08: a gramática do formato mudo com texto na tela, decodificada de duas
                  referências, e o teste de 5 frases no mesmo vídeo.
                </p>
              </div>
            </div>

            <div className="rc-bloco">
              <Print src="/conteudo/trazendo-seguidor.webp" alt="Página 'trazendo seguidor' com os números da sessão de 28/08: 14 no fluxo, 5 versões do reel, +252 seguidores em 3 dias" legenda="Bloco 7 · a conversa que montou o fluxo do comentário à DM" />
              <div>
                <span className="rc-bnum">07</span>
                <h3>Do comentário à DM</h3>
                <p>
                  184 pessoas comentaram &ldquo;sistema&rdquo;, 42% clicaram, 67 chegaram no link. O
                  fluxo inteiro, o erro 230 da API que quebra todo mundo que tenta repetir em casa (a
                  janela abre no clique, nunca no comentário), e os buracos que eu mesmo cavei: 38
                  sessões órfãs porque editei o fluxo ao vivo.
                </p>
              </div>
            </div>

            <div className="rc-bloco">
              <Print src="/conteudo/augusto.webp" alt="Augusto na câmera durante a aula" legenda="Bloco 8 · a escada, na câmera" />
              <div>
                <span className="rc-bnum">08</span>
                <h3>A escada pra quem não tem VPS nenhuma</h3>
                <p>
                  Seis degraus que dá pra fazer com pasta de salvos e qualquer chat de IA: referência
                  num lugar só, toda pauta pelo filtro, documento de voz, revisão em camadas, toda
                  correção vira regra escrita, e a regra vira skill. Mais o bônus: corte por
                  transcrição, 16 minutos de palestra em 70 segundos, zero Premiere.
                </p>
              </div>
            </div>
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
            <li><i>→</i><span><b>12 skills prontas na aba Skills</b>, as 6 da aula entre elas. Copia, cola no seu Claude e usa. Vêm calibradas pra mim; calibrar pro seu negócio é o trabalho de cada um, e a aula mostra como</span></li>
            <li><i>→</i><span><b>comenta EU QUERO</b>, a ferramenta do fluxo comentário → DM, sua, sem mensalidade</span></li>
            <li><i>→</i><span><b>IA Fundamentos</b>, <b>Vibecode</b> (criar qualquer sistema do zero, é onde está o setup que a aula assume) e a <b>Oficina Claude Code</b></span></li>
            <li><i>→</i><span><b>Encontro ao vivo todo mês</b>, Raio-X do seu negócio, Claudinei 24/7 e o grupo</span></li>
          </ul>
        </div>
      </section>

      {/* pra quem é */}
      <section className="rc-sec">
        <div className="p7-wrap">
          <span className="p7-eyebrow">Pra quem é</span>
          <h2 className="p7-h2">É pra quem quer fazer com a própria mão</h2>
          <p className="rc-lead">
            Se você posta (ou quer começar) e quer um sistema em vez de força de vontade, é pra você.
            Se você quer terceirizar pra uma agência, ou quer uma maquininha que posta sozinha, não
            é. Eu falo isso na aula também, no primeiro bloco.
          </p>

          <div className="p7-faq">
            <details>
              <summary>Não tenho VPS nem painel. Serve pra mim?</summary>
              <p>
                Serve. O bloco 8 é uma escada de seis degraus pra fazer com pasta de salvos do
                Instagram e qualquer chat de IA. As skills rodam no Claude sem servidor nenhum. O
                painel é o degrau de cima, e o Vibecode (que está no Club) ensina a construir.
              </p>
            </details>
            <details>
              <summary>Não sei programar.</summary>
              <p>
                Eu também não sabia direito. Tudo que aparece na aula foi construído conversando com
                o Claude. O que exige código é o painel e o radar, e esses dois têm curso próprio
                dentro do Club. O filtro, a voz, a revisão e os reels teste não exigem nada.
              </p>
            </details>
            <details>
              <summary>Vai sair tudo com cara de IA?</summary>
              <p>
                Esse é o bloco 4 inteiro. O documento de voz com os padrões proibidos e o /deslop, que
                acha o padrão e aponta a linha. Recibo honesto: ele achou 37 travessões e cinco
                &ldquo;não é X, é Y&rdquo; no próprio deck da aula, escritos por mim sem perceber.
              </p>
            </details>
            <details>
              <summary>Não tenho tempo pra produzir.</summary>
              <p>
                Ninguém tem. Por isso o bloco 4 começa pela agenda: 2 reels e 1 carrossel por semana,
                com hora marcada, e um reel teste custa uns 30 segundos do meu tempo. As primeiras
                semanas doem. Da terceira em diante você vê pauta em conversa de bar.
              </p>
            </details>
            <details>
              <summary>Você mostra tudo no feed. Por que pagar?</summary>
              <p>
                O feed mostra o resultado. A aula mostra a conversa inteira, com os vetos, as versões
                reprovadas e o número de cada tentativa. E entrega as skills prontas, que é o que
                você instala no dia seguinte.
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
