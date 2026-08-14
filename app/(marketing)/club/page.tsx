import type { Metadata } from 'next'
import HeroScrub from './HeroScrub'
import HeroLuz from './HeroLuz'
import SectionScrub from './SectionScrub'
import './v7.css'

export const metadata: Metadata = {
  title: 'Push Club — uma pessoa, o trabalho de dez',
  description:
    'A IA é uma alavanca: multiplica a força que você já tem. Todo mundo tem a mesma IA; quase ninguém sabe onde apoiar. R$70/mês.',
  alternates: { canonical: 'https://ia.augustogobatto.com/club' },
  openGraph: {
    type: 'website',
    url: 'https://ia.augustogobatto.com/club',
    title: 'Push Club — uma pessoa, o trabalho de dez',
    description:
      'A IA é uma alavanca: multiplica a força que você já tem. Todo mundo tem a mesma IA; quase ninguém sabe onde apoiar. R$70/mês.',
    images: [{ url: '/club-v7/og.jpg', width: 1200, height: 630 }],
  },
}

const STRIPE_MENSAL = 'https://buy.stripe.com/5kQ00k91qeVL2ve9JG9fW0f'
const STRIPE_ANUAL = 'https://buy.stripe.com/9B628s4La14Vb1KaNK9fW0g'

const HERO_ELEMENTS: Record<
  string,
  {
    src: string
    alt: string
    glb?: string
    video?: string
    luz?: boolean
    cru?: boolean
    spin?: boolean
    orbit?: string
    aspect?: string
  }
> = {
  default: {
    src: '/club-v7/bloco.jpg',
    alt: 'Bloco de pedra: metade bruta e fosca, metade esculpida em cunha polida',
  },
  '1': { src: '/club-v7/el1.jpg', alt: 'Esfera de granito na quina de um plinto, um instante antes de cair' },
  '3': { src: '/club-v7/el3.jpg', alt: 'Bloco de granito erguido por uma alavanca fina de aço' },
  '4': { src: '/club-v7/el4.jpg', alt: 'Bloco de pedra metade bruto, metade esculpido em cunha polida' },
  '4d': {
    src: '/club-v7/el4.jpg',
    alt: 'Bloco de pedra metade bruto, metade esculpido, em 3D',
    glb: '/club-v7/bloco-3d-web.glb',
    spin: true,
    orbit: '12deg 80deg 34%',
  },
  vid: {
    src: '/club-v7/bloco.jpg',
    alt: 'Bloco de pedra girando, controlado pelo movimento do mouse',
    video: '/club-v7/bloco-giro.mp4',
  },
  note: {
    src: '/club-v7/alavanca-note.jpg',
    alt: 'Notebook com código erguendo um bloco de granito numa alavanca; o mouse muda o ângulo',
    video: '/club-v7/alavanca-arco.mp4',
  },
  luz: {
    src: '/club-v7/alavanca-eclipse.webp',
    alt: 'Silhueta de um bloco de granito erguido por uma alavanca de aço, eclipsando uma luz forte',
    luz: true,
  },
  luz2: {
    src: '/club-v7/alavanca-b.jpg',
    alt: 'Bloco de granito erguido por uma alavanca de aço, em contraluz',
    luz: true,
  },
  cru: {
    src: '/club-v7/alavanca-eclipse.webp',
    alt: 'Bloco de granito erguido por uma alavanca de aço, sem iluminação',
    cru: true,
  },
  '3d': {
    src: '/club-v7/el3.jpg',
    alt: 'Bloco de granito sobre alavanca de aço, em 3D',
    glb: '/club-v7/alavanca-3d-web.glb',
    spin: false,
    orbit: '-24deg 82deg 26%',
    aspect: '1/1',
  },
}

// Rascunhos de hero pra lapidar. Trocar com ?h=1..6
const HEADLINES: Record<
  string,
  { nota: string; h1: React.ReactNode; sub: React.ReactNode }
> = {
  '1': {
    nota: 'atual, com sub corrigido',
    h1: (
      <>
        Gente pior que você, com IA, <em>vai te superar.</em>
      </>
    ),
    sub: (
      <>
        Harvard mediu isso em 758 consultores: os da metade de baixo subiram{' '}
        <strong>43%</strong> e passaram quem não usava nada. No Push Club eu abro a
        minha operação todo mês, com o número na tela, e você copia a peça que serve
        pro seu negócio.
      </>
    ),
  },
  '2': {
    nota: 'o aluguel da vantagem',
    h1: (
      <>
        O que você levou dez anos pra aprender, hoje o cara <em>aluga por 100 reais
        por mês.</em>
      </>
    ),
    sub: (
      <>
        Harvard mediu em 758 consultores: com IA, a metade de baixo subiu{' '}
        <strong>43%</strong> e passou quem não usava. O que ainda não dá pra alugar é
        saber o que montar primeiro, e é isso que eu abro todo mês no Push Club.
      </>
    ),
  },
  '3': {
    nota: 'a prova crua',
    h1: (
      <>
        Uma IA que eu configurei vendeu <em>R$140 mil num lançamento.</em>
      </>
    ),
    sub: (
      <>
        É uma das 10 que rodam a minha empresa hoje. Todo mês eu abro no ao vivo como
        cada uma foi montada, com o número na tela. R$70 por mês,
        e você monta a sua.
      </>
    ),
  },
  '4': {
    nota: 'o destino em número',
    h1: (
      <>
        2 milhões de faturamento. <em>3 pessoas.</em>
      </>
    ),
    sub: (
      <>
        É o tamanho de empresa que eu tô montando, com 10 IAs no lugar de time. Todo
        mês eu abro no ao vivo o que funcionou e o que eu joguei fora. R$70 por mês pra
        ver por dentro e copiar.
      </>
    ),
  },
  '5': {
    nota: 'a dor com sujeito e prazo',
    h1: (
      <>
        O novato com IA leva dois meses pra chegar <em>onde você levou anos.</em>
      </>
    ),
    sub: (
      <>
        Foi medido em 5 mil e pouco atendentes, e repetido em consultoria. O que ainda
        não vem no plano de 100 reais é saber o que montar primeiro. É isso que eu abro
        todo mês no Push Club.
      </>
    ),
  },
  '6': {
    nota: 'a tentativa frustrada (favorita do revisor)',
    h1: (
      <>
        Você paga ChatGPT há mais de um ano e o seu negócio <em>continua igual.</em>
      </>
    ),
    sub: (
      <>
        A culpa não é sua. A IA responde tudo que você pergunta com a mesma confiança,
        inclusive quando o plano é ruim, e ninguém nunca te disse o que montar primeiro.
        Eu tenho 10 assistentes rodando na minha empresa e todo mês eu abro no ao vivo
        qual deu dinheiro e qual eu joguei fora.
      </>
    ),
  },
  '8': {
    nota: 'A BIG IDEA (copy do Augusto 12/08)',
    h1: (
      <>
        Uma pessoa.
        <br />
        <em>O trabalho de dez.</em>
      </>
    ),
    sub: (
      <>
        A IA é uma alavanca: multiplica a força que você já tem.
        <br />
        Todo mundo tem a mesma IA. Quase ninguém sabe onde apoiar.
      </>
    ),
  },
  '7': {
    nota: 'variação sem "paga" (pra quem usa a versão grátis)',
    h1: (
      <>
        Faz um ano que você abre o ChatGPT todo dia e o seu negócio{' '}
        <em>continua igual.</em>
      </>
    ),
    sub: (
      <>
        A culpa não é sua. A IA responde tudo com a mesma confiança, inclusive quando o
        plano é ruim, e ninguém nunca te disse o que montar primeiro. Eu tenho 10
        assistentes rodando na minha empresa e todo mês eu abro no ao vivo qual deu
        dinheiro e qual eu joguei fora.
      </>
    ),
  },
}

export default function ClubV7Page({
  searchParams,
}: {
  searchParams?: { el?: string; h?: string }
}) {
  const hero = HERO_ELEMENTS[searchParams?.el ?? 'default'] ?? HERO_ELEMENTS.default
  const head = HEADLINES[searchParams?.h ?? '8'] ?? HEADLINES['8']
  return (
    <div className="p7">
      {/* topbar */}
      <header className="p7-bar">
        <div className="p7-bar-in">
          <a href="#" className="p7-mark">Push <em>Club</em></a>
          <a href="#planos" className="p7-pill">Entrar no Club</a>
        </div>
      </header>

      {/* hero: elemento à esquerda · frase grande + frase pequena + botão */}
      <section className="p7-hero">
        <div className="p7-wrap">
          <div className="p7-hero-grid">
            <div className="p7-hero-txt">
              <h1 className="p7-h1 p7-r">{head.h1}</h1>
              <p className="p7-sub p7-r">{head.sub}</p>
              <div className="p7-cta-row p7-r">
                <a href="#planos" className="p7-pill big">Entrar no Push Club</a>
              </div>
            </div>
            <div className="p7-hero-el p7-r">
              {hero.cru ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={hero.src}
                  alt={hero.alt}
                  style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'contain', display: 'block' }}
                />
              ) : hero.luz ? (
                <HeroLuz src={hero.src} alt={hero.alt} />
              ) : hero.video ? (
                <HeroScrub src={hero.video} poster={hero.src} alt={hero.alt} />
              ) : hero.glb ? (
                <div
                  className="p7-hero-3d"
                  dangerouslySetInnerHTML={{
                    __html: `<model-viewer id="p7mv" src="${hero.glb}" alt="${hero.alt}"
                      ${hero.spin ? 'auto-rotate rotation-per-second="6deg" camera-controls disable-zoom disable-pan' : ''}
                      interaction-prompt="none" exposure="1.1" shadow-intensity="0"
                      environment-image="/club-v7/studio.hdr"
                      camera-orbit="${hero.orbit ?? '12deg 80deg 42%'}"
                      style="width:100%;aspect-ratio:${hero.aspect ?? '4/5'};background:transparent;--progress-bar-color:transparent;"></model-viewer>
                    <script type="module" src="https://unpkg.com/@google/model-viewer@3.5.0/dist/model-viewer.min.js"></script>
                    ${
                      hero.spin
                        ? ''
                        : `<script>(function(){
                      function start(){
                        var mv=document.getElementById('p7mv');
                        if(!mv){return}
                        var base=${JSON.stringify(hero.orbit ?? '12deg 80deg 42%')}.split(' ');
                        var t0=parseFloat(base[0]),p0=parseFloat(base[1]),r=base[2];
                        var tx=t0,ty=p0,cx=t0,cy=p0;
                        addEventListener('pointermove',function(e){
                          var nx=e.clientX/innerWidth*2-1, ny=e.clientY/innerHeight*2-1;
                          tx=t0+nx*30; ty=p0-ny*12;
                        },{passive:true});
                        (function loop(){
                          cx+=(tx-cx)*0.09; cy+=(ty-cy)*0.09;
                          mv.cameraOrbit=cx.toFixed(2)+'deg '+cy.toFixed(2)+'deg '+r;
                          requestAnimationFrame(loop);
                        })();
                      }
                      if(window.customElements&&customElements.whenDefined){
                        customElements.whenDefined('model-viewer').then(start);
                      }else{addEventListener('load',start)}
                    })();</script>`
                    }`,
                  }}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={hero.src} alt={hero.alt} className="p7-hero-img" />
              )}
            </div>
          </div>
          <p className="p7-hero-epi p7-r">
            &ldquo;Dê-me um ponto de apoio e uma alavanca, e moverei o mundo.&rdquo;{' '}
            <span className="a">Arquimedes</span>
          </p>
        </div>
      </section>

      {/* seção 2: a demonstração */}
      <section className="p7-stage" id="entenda">
        <div className="p7-wrap">
          <h2 className="p7-h2 p7-r">
            A alavanca todo mundo ganhou.<br />O ponto de apoio, ninguém deu.
          </h2>
          <div className="p7-measure p7-r">
            <p className="p7-dim">
              Abrir o ChatGPT e perguntar se vai chover amanhã também é usar IA. É o uso
              que te venderam. Funciona. Só levanta um peso ridículo perto do que a
              ferramenta aguenta.
            </p>
          </div>
          <SectionScrub
            src="/club-v7/fulcro-loop.mp4" poster="/club-v7/fulcro.jpg"
            alt="Um ponto de apoio de aço despencando sob o feixe de luz"
            className="p7-figura p7-r"
            cauda
          />
        </div>
      </section>

      {/* 03 · sábado passado */}
      <section className="p7-sec">
        <div className="p7-wrap">
          <div className="p7-duo">
            <div>
              <span className="p7-eyebrow p7-r">Sábado passado</span>
              <p className="p7-dim p7-r" style={{ marginTop: 6 }}>
                Sábado eu peguei o celular no carro e mandei um áudio pra minha IA. Enquanto
                eu dirigia, ela entrou nas páginas do meu curso e testou as automações uma
                por uma. Corrigiu as que estavam quebradas. Entrou na minha conta de anúncios
                e atualizou os links. Conferiu se as vendas estavam caindo na Hotmart com o
                rastreio certo. E mandou o relatório de tudo no grupo.
              </p>
              <p className="p7-destaque p7-r">
                Um testador, um programador, um gestor de tráfego, um analista e um
                estagiário. Dez minutos. Eu dirigindo.
              </p>
              <p className="p7-dim p7-r">
                É a mesma IA que você tem. A diferença não está na ferramenta. Está em onde
                ela foi apoiada.
              </p>
            </div>
            <div className="p7-stats p7-r">
              <div className="p7-stat">
                <span className="n">15</span>
                <span className="l">serviços rodando 24 horas por dia na minha operação. Agora, enquanto você lê isso.</span>
              </div>
              <div className="p7-stat">
                <span className="n">43</span>
                <span className="l">tarefas que acontecem todo dia sem eu abrir o computador. Conciliação, cobrança, relatório, vigia de erro.</span>
              </div>
              <div className="p7-stat">
                {/* legenda do 0 é obrigatória: sem a âncora da empresa separada o número vira alegação contestável */}
                <span className="n">0</span>
                <span className="l">funcionários nessa operação. É uma empresa separada que eu montei só pra testar IA: eu e as máquinas.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* seção 3: o filtro */}
      <section className="p7-sec">
        <div className="p7-wrap">
          <span className="p7-eyebrow p7-r">O filtro</span>
          <h2 className="p7-h2 p7-r">Traz dinheiro, tira custo, ou te tira do meio.</h2>
          <p className="p7-dim p7-r" style={{ marginTop: 18, maxWidth: '62ch' }}>
            Antes de montar qualquer coisa eu pergunto isso. Se não faz nenhum dos três, é
            brinquedo caro.
          </p>
          <div className="p7-ledger p7-r">
            <div className="p7-led-row">
              <h3 className="p7-pilar">Traz dinheiro.</h3>
              <div className="p7-led-exs">
                <p className="p7-dim"><strong>R$300 mil</strong> · total já vendido pela IA que atende meu WhatsApp.</p>
                <p className="p7-dim"><strong>R$30 mil</strong> · a área de membros do Club virou aplicativo. Feita do zero, com IA.</p>
              </div>
            </div>
            <div className="p7-led-row">
              <h3 className="p7-pilar">Tira custo.</h3>
              <div className="p7-led-exs">
                <p className="p7-dim"><strong>R$12 mil/mês</strong> · três vagas no comercial que não precisaram ser repostas. As vendas continuaram iguais.</p>
                <p className="p7-dim"><strong>R$20 mil/ano</strong> · montei meu próprio ManyChat. A mensalidade sumiu.</p>
                <p className="p7-dim"><strong>R$1.000/mês</strong> · 151 minutos de aula editados sem eu tocar no mouse.</p>
              </div>
            </div>
            <div className="p7-led-row">
              <h3 className="p7-pilar">Te tira do meio.</h3>
              <div className="p7-led-exs">
                <p className="p7-dim"><strong>10 minutos</strong> · testou o site, corrigiu, atualizou os anúncios e mandou o relatório. Eu dirigindo.</p>
                <p className="p7-dim"><strong>43 tarefas</strong> · rodam todo dia sem eu abrir o computador.</p>
                <p className="p7-dim"><strong>3 a 4 horas</strong> · por dia, que eu não gasto mais com proposta, relatório e disparo.</p>
              </div>
            </div>
          </div>
          <p className="p7-dim p7-r" style={{ marginTop: 36, maxWidth: '62ch' }}>
            Não é só comigo. O Levi parou de pagar gestor de tráfego. O Camargo era
            copywriter e hoje ninguém troca ele.
          </p>
          <p className="p7-destaque p7-r">Inclusive esta página. R$3.500 que eu não paguei.</p>
        </div>
      </section>

      {/* 05 · gente comum com a mão na alavanca — conversas reais do grupo, transcritas */}
      <section className="p7-sec">
        <div className="p7-wrap">
          <h2 className="p7-h2 p7-r">Gente normal* usando isso hoje.</h2>
          <p className="p7-dim p7-r" style={{ marginTop: 18 }}>
            <span className="p7-nota">*normal = não dev.</span>
            <br />Conversas reais do grupo do Club, transcritas na íntegra.
          </p>
          <div className="p7-troop">
            <div className="p7-chat p7-r">
              <span className="nome">Jhonathan <em>tráfego</em></span>
              <div className="balao">
                Ta suavão, se fizer do jeito que ele falou vai que vai, tenho o meu agente
                rodando lindamente, subindo anuncio, pausando, dando pitaco, coisa linda de
                ver!
                <span className="hora">15/07 · 16:15</span>
              </div>
            </div>
            <div className="p7-chat p7-r">
              <span className="nome">João Luís <em>robôs industriais</em></span>
              <div className="balao">
                Todo o código foi feito pela ia, em poucos segundos [&hellip;] Do desenho pro
                real em menos de 5 min, serviço manual que demoraria pelo menos 2 a 3 hrs
                <span className="hora">24/07 · 21:35</span>
              </div>
            </div>
            <div className="p7-chat p7-r">
              <span className="nome">Marcelo</span>
              <div className="balao">
                Timeee finalmente construí meu agente estou feliz pra caramba
                <span className="hora">08/07 · 12:10</span>
              </div>
              <div className="balao">
                era 4h00 da manhã tava mandando mensagem pra mim especialista mandando a I.A
                pra ela
                <span className="hora">08/07 · 12:12</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* seção 4: o que o guru não te conta */}
      <section className="p7-stage">
        <div className="p7-wrap">
          <span className="p7-eyebrow p7-r">A parte que o guru de IA não te conta</span>
          <h2 className="p7-h2 p7-r">IA crua amplifica o critério que você já tem. Inclusive a falta dele.</h2>
          <div className="p7-measure p7-r">
            <p className="p7-dim">
              O único estudo grande feito com donos de pequeno negócio (640 empreendedores no
              Quênia, publicado na Management Science) deu o resultado invertido. Quem já ia bem
              cresceu 15% usando IA. Quem ia mal piorou 8%.
            </p>
            <p className="p7-dim">
              O motivo, medido no estudo: a diferença não estava no conselho que a IA dava,
              estava no julgamento pra saber qual conselho implementar. A IA responde
              qualquer coisa com a mesma confiança. Quem não sabe separar o que funciona do
              que soa bonito implementa o que soa bonito. E afunda mais rápido, só que agora
              com assinatura mensal.
            </p>
            <p className="p7-dim">
              E na velocidade que isso anda, curso gravado em janeiro morre em julho.
              Critério não desatualiza.
            </p>
            <p className="p7-destaque">
              Todo mundo te vende a ferramenta. Ninguém te vende o critério. O Club é o
              critério, com a ferramenta dentro.
            </p>
          </div>
        </div>
      </section>

      {/* seção 5: quem eu sou */}
      <section className="p7-sec">
        <div className="p7-wrap">
          <div className="p7-duo">
            <div>
              <span className="p7-eyebrow p7-r">Por que eu posso falar disso</span>
              <h2 className="p7-h2 p7-r">Eu sou o experimento.</h2>
              <p className="p7-dim p7-r" style={{ marginTop: 18 }}>
                10 anos de mercado digital. Mais de 300 lançamentos analisados. Sou sócio de
                empresas que faturam milhões e que eu não posso virar de cabeça pra baixo pra
                testar IA. Então montei uma empresa separada só pra isso: eu e as máquinas.
              </p>
              <p className="p7-dim p7-r">
                Hoje ela tem 15 serviços e 43 tarefas rodando. Um responde meus alunos. Um
                cuida do dinheiro. Um garimpa leads nos meus comentários. Foi a IA que
                atendeu os leads de um lançamento de R$140 mil.
              </p>
              <p className="p7-dim p7-r">
                Onde isso vai dar: 2 milhões de faturamento com 3 pessoas. Empresa enxuta,
                sem inchar time, sem virar refém de agência. É o caminho que eu tô
                percorrendo em público, e é ele que o Club te entrega pronto pra copiar.
              </p>
            </div>
            <div className="p7-r">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/gobatto.jpg" alt="Augusto Gobatto" className="p7-retrato" />
            </div>
          </div>
        </div>
      </section>

      {/* seção 6: o que tem dentro */}
      <section className="p7-sec">
        <div className="p7-wrap">
          <span className="p7-eyebrow p7-r">O que tem dentro</span>
          <h2 className="p7-h2 p7-r">Tudo isso entra junto, no mesmo login.</h2>
          <div className="p7-bento">
            <div className="p7-card p7-r">
              <span className="tag">ia de vendas no whatsapp</span>
              <h3>Sai com um vendedor de IA atendendo teu WhatsApp</h3>
              <p>Workshop completo, 20 aulas. A mesma peça que já vendeu R$300 mil no total nas minhas empresas, atendendo sozinha.</p>
            </div>
            <div className="p7-card p7-r">
              <span className="tag">24/7 no Telegram</span>
              <h3>Claudinei, treinado em tudo que já foi dito aqui</h3>
              <p>Travou às 23h? Ele te aponta o minuto exato da aula. E ele mesmo é a prova: foi montado com o método.</p>
            </div>
            <div className="p7-card p7-r">
              <span className="tag">todo mês, ao vivo</span>
              <h3>Raio-X: um negócio de membro aberto na mesa</h3>
              <p>Uma vez por mês a gente senta em cima de uma operação real: vamos resolver a vida desse cara. Na próxima pode ser a sua.</p>
            </div>
            <div className="p7-card p7-r">
              <span className="tag">ferramenta inclusa</span>
              <h3>O CEQ, seu ManyChat próprio</h3>
              <p>A ferramenta que substituiu minha assinatura de ManyChat, inclusa. R$20 mil por ano que somem da conta.</p>
            </div>
            <div className="p7-card p7-r">
              <span className="tag">vibecoding</span>
              <h3>O primeiro sistema na primeira semana</h3>
              <p>No Vibecode você constrói desde a primeira aula. A enquete de quem já construiu foi feita ao vivo.</p>
            </div>
            <div className="p7-card p7-r">
              <span className="tag">biblioteca viva</span>
              <h3>Templates e prompts de tudo que aparece em aula</h3>
              <p>Aula ao vivo todo mês, e cada fluxo, prompt e template mostrado fica na biblioteca pra copiar.</p>
            </div>
          </div>
          <div className="p7-mcp p7-r">
            <div>
              <h3 className="p7-mcp-titulo">MCP</h3>
              <p className="p7-dim">
                Todo o conhecimento do Club se conecta no seu Claude, como um chip de
                aprendizado: você pede pra ele te ajudar a fazer, ou manda ele executar
                por você.
              </p>
            </div>
            <SectionScrub
              src="/club-v7/mcp.mp4" poster="/club-v7/mcp-poster.jpg"
              alt="Uma peça de aço encaixando no lugar exato"
              className="p7-figura"
              cauda
              segura
            />
          </div>
          <p className="p7-dim p7-r" style={{ marginTop: 56 }}>
            São 7 cursos e 50 aulas. No fim, isso aqui deixa de ser jargão:
          </p>
          <div className="p7-tools p7-r">
            <div><strong>Claude Code</strong><span>seu operador no terminal: escreve, roda e conserta o código de qualquer sistema seu.</span></div>
            <div><strong>n8n</strong><span>o fluxo que recebe a mensagem no WhatsApp, passa pela IA e responde sozinho.</span></div>
            <div><strong>API oficial do WhatsApp</strong><span>o vendedor de IA no seu número, com passagem pra humano quando precisa.</span></div>
            <div><strong>Supabase</strong><span>o banco e o login de qualquer sistema que você criar.</span></div>
            <div><strong>VPS</strong><span>o servidor onde seus robôs moram, rodando com o teu computador desligado.</span></div>
            <div><strong>MCP</strong><span>o Claude plugado nas suas ferramentas: banco, planilha, sistemas.</span></div>
            <div><strong>GitHub + Vercel</strong><span>o código guardado e o site publicado com URL própria, em minutos.</span></div>
            <div><strong>Chatwoot</strong><span>todas as conversas dos seus agentes num painel só.</span></div>
          </div>
        </div>
      </section>

      {/* a turma: perfis reais garimpados do grupo (13/08) — fotos entram quando cada membro validar */}
      <section className="p7-sec">
        <div className="p7-wrap">
          <span className="p7-eyebrow p7-r">A turma</span>
          <h2 className="p7-h2 p7-r">Quem tá montando junto.</h2>
          <p className="p7-dim p7-r" style={{ marginTop: 18, maxWidth: '62ch' }}>
            Mais de 50 membros ativos. Alguns deles, e o que já colocaram pra rodar:
          </p>
          <div className="p7-esteira p7-r">
            <div className="p7-esteira-fita">
            <div className="p7-membro">
              <span className="av">M</span>
              <div>
                <strong>Matheus</strong>
                <em>implementa IA pra clientes</em>
                <p>Montou o próprio agente de vendas, o Caio, e hoje vende implementação pra clínicas.</p>
              </div>
            </div>
            <div className="p7-membro">
              <span className="av">P</span>
              <div>
                <strong>Poliana</strong>
                <em>sócia de agência</em>
                <p>Montou o sistema central da agência e um agente no Telegram pro especialista que atende.</p>
              </div>
            </div>
            <div className="p7-membro">
              <span className="av">J</span>
              <div>
                <strong>Jhonathan</strong>
                <em>gestor de tráfego</em>
                <p>Agente ligado na conta de anúncios: sobe, pausa e dá pitaco nas campanhas.</p>
              </div>
            </div>
            <div className="p7-membro">
              <span className="av">JL</span>
              <div>
                <strong>João Luís</strong>
                <em>robôs industriais</em>
                <p>Programa de robô codado por IA: do desenho ao movimento real em 5 minutos.</p>
              </div>
            </div>
            <div className="p7-membro">
              <span className="av">K</span>
              <div>
                <strong>Kauan</strong>
                <em>marketing em escala</em>
                <p>Implementando o ManyChat próprio pra um expert de mais de 1 milhão de seguidores.</p>
              </div>
            </div>
            <div className="p7-membro">
              <span className="av">M</span>
              <div>
                <strong>Marcelo</strong>
                <em>operação de lançamento</em>
                <p>Agente no WhatsApp pela API oficial e disparador de avisos no n8n.</p>
              </div>
            </div>
            <div className="p7-membro">
              <span className="av">V</span>
              <div>
                <strong>Venicio</strong>
                <em>produto digital próprio</em>
                <p>Recuperação de venda e entrega de acesso rodando sozinhas no WhatsApp.</p>
              </div>
            </div>
            <div className="p7-membro">
              <span className="av">H</span>
              <div>
                <strong>Henrique</strong>
                <em>coprodutor de lançamentos</em>
                <p>Chegou sem saber quase nada. Já constrói automações com Claude e MCP no n8n.</p>
              </div>
            </div>
            <div className="p7-membro">
              <span className="av">R</span>
              <div>
                <strong>Ritielle</strong>
                <em>agência + professor universitário</em>
                <p>Instalou a ferramenta de comentários do club na operação da agência.</p>
              </div>
            </div>
            <div className="p7-membro">
              <span className="av">D</span>
              <div>
                <strong>Darle</strong>
                <em>vendas no WhatsApp</em>
                <p>Criou a agente Sonata em cima do prompt da aula e já atende leads reais.</p>
              </div>
            </div>
            <div className="p7-membro">
              <span className="av">E</span>
              <div>
                <strong>Elton</strong>
                <em>consultoria de marketplace</em>
                <p>Chegou com n8n e Evolution rodando e entrou pra melhorar a captação de leads.</p>
              </div>
            </div>
            <div className="p7-membro">
              <span className="av">M</span>
              <div>
                <strong>Matheus</strong>
                <em>implementa IA pra clientes</em>
                <p>Montou o próprio agente de vendas, o Caio, e hoje vende implementação pra clínicas.</p>
              </div>
            </div>
            <div className="p7-membro">
              <span className="av">P</span>
              <div>
                <strong>Poliana</strong>
                <em>sócia de agência</em>
                <p>Montou o sistema central da agência e um agente no Telegram pro especialista que atende.</p>
              </div>
            </div>
            <div className="p7-membro">
              <span className="av">J</span>
              <div>
                <strong>Jhonathan</strong>
                <em>gestor de tráfego</em>
                <p>Agente ligado na conta de anúncios: sobe, pausa e dá pitaco nas campanhas.</p>
              </div>
            </div>
            <div className="p7-membro">
              <span className="av">JL</span>
              <div>
                <strong>João Luís</strong>
                <em>robôs industriais</em>
                <p>Programa de robô codado por IA: do desenho ao movimento real em 5 minutos.</p>
              </div>
            </div>
            <div className="p7-membro">
              <span className="av">K</span>
              <div>
                <strong>Kauan</strong>
                <em>marketing em escala</em>
                <p>Implementando o ManyChat próprio pra um expert de mais de 1 milhão de seguidores.</p>
              </div>
            </div>
            <div className="p7-membro">
              <span className="av">M</span>
              <div>
                <strong>Marcelo</strong>
                <em>operação de lançamento</em>
                <p>Agente no WhatsApp pela API oficial e disparador de avisos no n8n.</p>
              </div>
            </div>
            <div className="p7-membro">
              <span className="av">V</span>
              <div>
                <strong>Venicio</strong>
                <em>produto digital próprio</em>
                <p>Recuperação de venda e entrega de acesso rodando sozinhas no WhatsApp.</p>
              </div>
            </div>
            <div className="p7-membro">
              <span className="av">H</span>
              <div>
                <strong>Henrique</strong>
                <em>coprodutor de lançamentos</em>
                <p>Chegou sem saber quase nada. Já constrói automações com Claude e MCP no n8n.</p>
              </div>
            </div>
            <div className="p7-membro">
              <span className="av">R</span>
              <div>
                <strong>Ritielle</strong>
                <em>agência + professor universitário</em>
                <p>Instalou a ferramenta de comentários do club na operação da agência.</p>
              </div>
            </div>
            <div className="p7-membro">
              <span className="av">D</span>
              <div>
                <strong>Darle</strong>
                <em>vendas no WhatsApp</em>
                <p>Criou a agente Sonata em cima do prompt da aula e já atende leads reais.</p>
              </div>
            </div>
            <div className="p7-membro">
              <span className="av">E</span>
              <div>
                <strong>Elton</strong>
                <em>consultoria de marketplace</em>
                <p>Chegou com n8n e Evolution rodando e entrou pra melhorar a captação de leads.</p>
              </div>
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* seção 8: quanto custa */}
      <section className="p7-sec p7-centro" id="planos">
        <div className="p7-wrap">
          <span className="p7-eyebrow p7-r">Quanto custa</span>
          <h2 className="p7-h2 p7-r">O mesmo caminho, por outras portas:</h2>
          <p className="p7-dim p7-r" style={{ marginTop: 18, maxWidth: '62ch' }}>
            Eu vendi uma implementação de R$20 mil pra alguém que conhecia o
            Club e pagou assim mesmo: &ldquo;eu quero que você faça&rdquo;.
          </p>
          <div className="p7-anchor p7-r">
            <div className="p7-anchor-row"><span>implementação feita por mim</span><i /><span>R$20.000</span></div>
            <div className="p7-anchor-row"><span>mentoria individual</span><i /><span>R$10 a 15 mil por ano</span></div>
            <div className="p7-anchor-row"><span>tabela cheia do Club</span><i /><span>R$150/mês</span></div>
            <div className="p7-anchor-row hot"><span>Push Club hoje</span><i /><span>R$70/mês</span></div>
          </div>

          <div className="p7-plans">
            <div className="p7-plan p7-r">
              <span className="name">mensal</span>
              <div className="price">R$70<small>/mês</small></div>
              <span className="eq">sem fidelidade, fica um mês se quiser</span>
              <ul>
                <li>Encontro ao vivo todo mês</li>
                <li>Todos os workshops gravados</li>
                <li>Claudinei 24/7 + grupo</li>
                <li>Biblioteca de fluxos</li>
                <li>Raio-X ao vivo — seu negócio pode ser o da mesa</li>
              </ul>
              <a href={STRIPE_MENSAL} className="p7-pill ghost" data-checkout="mensal">Quero entrar por R$70</a>
            </div>
            <div className="p7-plan hot p7-r">
              <span className="p7-badge">vale mais a pena · 2 meses grátis</span>
              <span className="name">anual</span>
              <div className="price">R$600<small>/ano</small></div>
              <span className="eq">= R$50/mês · economia de R$240</span>
              <ul>
                <li>Tudo do plano mensal</li>
                <li>Uma cobrança só no ano, sem mensalidade no cartão</li>
                <li>Prioridade nas turmas ao vivo</li>
              </ul>
              <a href={STRIPE_ANUAL} className="p7-pill" data-checkout="anual">Quero o anual: R$50/mês</a>
            </div>
          </div>

          <p className="p7-fine p7-r" style={{ marginBottom: 6 }}>
            acesso imediato, cancela quando quiser
          </p>
          <p className="p7-fine p7-r" style={{ marginBottom: 6 }}>
            O preço que você entra é o que você paga, nos dois planos, enquanto você ficar.
            Daqui pra frente ele só sobe: a tabela vai pra R$150.
          </p>
          <p className="p7-fine p7-r">
            Sem garantia teatral de 30 dias. Você tem os 7 dias de arrependimento que a lei
            dá, e depois disso R$70 não é risco: cancelar são dois cliques.
          </p>
        </div>
      </section>

      {/* 11 · cascata de prova — quotes verbatim do grupo (prints reais: fila de upgrade) */}
      <section className="p7-sec p7-centro">
        <div className="p7-wrap">
          <span className="p7-eyebrow p7-r">Direto do grupo</span>
          <div className="p7-cascata p7-r">
            <div className="p7-quote">
              <p>&ldquo;Eu to amando isso da gente conseguir puxar pra nós mais o controle das ferramentas&hellip;. Já paguei muito caro em ferramenta que prometia muito e entregava nada&rdquo;</p>
              <span className="who">Poliana · agência · 22/07</span>
            </div>
            <div className="p7-quote">
              <p>&ldquo;Eu não sabia praticamente nada&hellip; mas só com o pouco que já estou aprendendo, já consegui construir algumas coisas bem legais&rdquo;</p>
              <span className="who">Henrique · estrategista digital · 27/05</span>
            </div>
            <div className="p7-quote">
              <p>&ldquo;achei a didática muito boa, a explicação, a fundamentação das coisas também [&hellip;] inclusive criei um outro fluxo que não tem nada a ver, um disparador no n8n&rdquo;</p>
              <span className="who">Marcelo · áudio no grupo · 08/07</span>
            </div>
            <div className="p7-quote">
              <p>&ldquo;Comenta eu Quero, instalado por aqui!!!&rdquo;</p>
              <span className="who">Ritielle · Orca Mídias, professor universitário · 30/07</span>
            </div>
            <div className="p7-quote">
              <p>&ldquo;muito massa workshop de claude&hellip; Tô aqui contigo pra mete uns experimento muito locuo com isso tudo ai&rdquo;</p>
              <span className="who">Beto · 08/06</span>
            </div>
          </div>
        </div>
      </section>

      {/* seção 9: FAQ */}
      <section className="p7-sec p7-centro">
        <div className="p7-wrap">
          <span className="p7-eyebrow p7-r">Dúvidas diretas</span>
          <h2 className="p7-h2 p7-r">Perguntas que chegam na DM</h2>
          <div className="p7-faq p7-r">
            <details>
              <summary>Preciso saber programar?</summary>
              <p>Não. Eu não sou programador, montei tudo isso conversando com a IA. A maior parte da turma é dono de negócio. O que você precisa é do critério, e é isso que a gente te dá.</p>
            </details>
            <details>
              <summary>Sou iniciante total em IA. É pra mim?</summary>
              <p>É. O ganho com IA é maior justamente pra quem estava atrás. O que trava iniciante não é a ferramenta, é não saber onde começar. Você entra, leva onde trava pro encontro ao vivo, e sai com uma peça pra montar.</p>
            </details>
            <details>
              <summary>Não dá pra aprender isso de graça no YouTube?</summary>
              <p>Se desse, você já teria feito.</p>
            </details>
            <details>
              <summary>Não tenho tempo.</summary>
              <p>Você acabou de descrever o problema que o Club trata. Quem faz o trabalho de dez é exatamente quem não tem tempo. A assinatura devolve tempo, não consome.</p>
            </details>
            <details>
              <summary>O que exatamente eu recebo ao assinar?</summary>
              <p>Acesso a tudo que já existe: os workshops gravados, a biblioteca de fluxos do n8n, o Claudinei no Telegram e o grupo. Mais o encontro ao vivo todo mês e o Raio-X, onde um negócio da turma vai pra mesa comigo — pode ser o seu. O que eu lançar depois entra sem custo.</p>
            </details>
            <details>
              <summary>Posso cancelar quando quiser?</summary>
              <p>Sim. 2 cliques, sem multa. O acesso fica até o fim do período pago, e você volta quando quiser, pelo preço da tabela do dia.</p>
            </details>
            <details>
              <summary>Por que &ldquo;Push&rdquo;?</summary>
              <p>Porque quando você publica um sistema, você faz um push. E também vem de empurrar: no Club a gente te dá aquele empurrão que falta pra você avançar.</p>
            </details>
          </div>
        </div>
      </section>

      {/* seção 10: fechamento */}
      <section className="p7-final">
        <div className="p7-wrap">
          <SectionScrub
            src="/club-v7/alavanca-queda.mp4" poster="/club-v7/alavanca-queda-poster.jpg"
            alt="Uma alavanca de aço caindo do apoio e ficando largada no chão"
            className="p7-figura p7-r" style={{ marginBottom: 8 }}
            cauda
          />
          <span className="p7-eyebrow p7-r">Se nada mudar</span>
          <h2 className="p7-h2 p7-r">
            A alavanca pode mover o mundo.<br />Largada no chão, não move nada.
          </h2>
          <p className="p7-sub p7-r" style={{ maxWidth: '52ch' }}>
            As ferramentas estão aí, aprenda a usá-las.
          </p>
          <div className="p7-cta-row p7-r">
            <a href="#planos" className="p7-pill big">Entrar no Push Club</a>
            <span className="p7-cta-note">R$70/mês · sem fidelidade</span>
          </div>
        </div>
      </section>

      <footer className="p7-footer">
        <div className="p7-footer-in">
          <span>© {new Date().getFullYear()} Augusto Gobatto</span>
          <span>cancelamento em 2 cliques · 7 dias de arrependimento (art. 49, CDC)</span>
          <a href="/privacidade">privacidade</a>
        </div>
      </footer>

      {/* rastreio (fonte única) + reveal */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){
var MAXLEN=120,KEY='club_primeiro_toque',TTL=2592e6;
function norm(v){return String(v||'').trim().replace(/\\s+/g,'-').replace(/^\\|+|\\|+$/g,'')}
var q;try{q=new URLSearchParams(location.search)}catch(e){q=null}
if(q){
  var sck=norm(q.get('sck'));
  if(!sck)sck=['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].map(function(k){return norm(q.get(k))}).filter(Boolean).join('|');
  sck=sck.slice(0,MAXLEN).replace(/\\|+$/,'');
  try{
    if(sck){localStorage.setItem(KEY,JSON.stringify({v:sck,t:Date.now()}))}
    else{var s=JSON.parse(localStorage.getItem(KEY)||'null');if(s&&s.v&&Date.now()-s.t<TTL)sck=s.v}
  }catch(e){}
  if(sck){
    [].forEach.call(document.querySelectorAll('a[href*="buy.stripe.com"]'),function(a){
      try{var u=new URL(a.getAttribute('href'));u.searchParams.set('client_reference_id',sck.slice(0,200).replace(/[^a-zA-Z0-9|_-]/g,'-'));a.href=u.toString()}catch(e){}
    });
  }
}
})();
(function(){
// rolagem com calma nos anchors (#entenda, #planos): ease-in-out ~1.1s
if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
function ease(t){return t<0.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}
document.addEventListener('click',function(e){
  var a=e.target&&e.target.closest?e.target.closest('a[href^="#"]'):null;
  if(!a)return;
  var alvo=document.getElementById(a.getAttribute('href').slice(1));
  if(!alvo)return;
  e.preventDefault();
  var de=window.scrollY,ate=alvo.getBoundingClientRect().top+de-24,ini=null,DUR=1100;
  function passo(ts){
    if(ini===null)ini=ts;
    var p=Math.min(1,(ts-ini)/DUR);
    window.scrollTo(0,de+(ate-de)*ease(p));
    if(p<1)requestAnimationFrame(passo);
    else history.replaceState(null,'',a.getAttribute('href'));
  }
  requestAnimationFrame(passo);
});
})();`,
        }}
      />
    </div>
  )
}
