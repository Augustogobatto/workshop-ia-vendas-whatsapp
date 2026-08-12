import type { Metadata } from 'next'
import HeroScrub from './HeroScrub'
import HeroLuz from './HeroLuz'
import './v7.css'

export const metadata: Metadata = {
  title: 'Push Club — gente pior que você, com IA, vai te superar',
  description:
    'Harvard mediu: profissionais medianos com IA ganharam 43% de desempenho. O Push Club é as peças validadas e o critério de quem já montou, por R$70/mês.',
  robots: { index: false, follow: false }, // preview: liberar indexação só quando assumir a /club
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
        cada uma foi montada, com o painel de faturamento aberto do lado. R$70 por mês,
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
        Aprenda a utilizar IA como uma alavanca para multiplicar seu potencial.
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
                <a href="#entenda" className="p7-pill big ghost">Entenda</a>
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
        </div>
      </section>

      {/* faixa de fatos */}
      <div className="p7-facts">
        <div className="p7-facts-in">
          <span>IA no Whats</span>
          <span>MCP</span>
          <span>Agente de IA</span>
          <span>Vibecoding</span>
          <span>Dashboard</span>
        </div>
      </div>

      {/* sábado passado */}
      {/* números 15 e 43 = levantamento de 12/08/2026; conteúdo vivo, reconferir ao subir serviço novo */}
      <section className="p7-stage" id="entenda">
        <div className="p7-wrap">
          <p className="p7-epi p7-r">
            &ldquo;Dê-me um ponto de apoio e uma alavanca, e moverei o mundo.&rdquo;
            <span className="a">Arquimedes</span>
          </p>
          <h2 className="p7-h2 p7-r" style={{ maxWidth: '30ch' }}>
            A alavanca todo mundo ganhou.<br />O ponto de apoio, ninguém deu.
          </h2>
          <div className="p7-measure p7-r">
            <p className="p7-dim">
              Abrir o ChatGPT e perguntar se vai chover amanhã também é usar IA. É o uso
              que te venderam. Funciona. Só levanta um peso ridículo perto do que a
              ferramenta aguenta.
            </p>
            <p className="p7-dim">
              Sábado eu peguei o celular no carro e mandei um áudio pra minha IA. Enquanto
              eu dirigia, ela entrou nas páginas do meu curso e testou as automações uma
              por uma. Corrigiu as que estavam quebradas. Entrou na minha conta de anúncios
              e atualizou os links. Conferiu se as vendas estavam caindo na Hotmart com o
              rastreio certo. E mandou o relatório de tudo no grupo.
            </p>
            <p className="p7-destaque">
              Um testador, um programador, um gestor de tráfego, um analista e um
              estagiário. Dez minutos. Eu dirigindo.
            </p>
            <p className="p7-dim">
              É a mesma IA que você tem. A diferença não está na ferramenta. Está em onde
              ela foi apoiada.
            </p>
          </div>
          <div className="p7-stats-row p7-r">
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
      </section>

      {/* a reviravolta */}
      <section className="p7-stage">
        <div className="p7-wrap">
          <span className="p7-eyebrow p7-r">A parte que o guru de IA não te conta</span>
          <h2 className="p7-h2 p7-r">IA crua amplifica o critério que você já tem. Inclusive a falta dele.</h2>
          <div className="p7-measure p7-r">
            <p className="p7-dim">
              O único estudo desses feito com <strong>donos de pequeno negócio</strong> (640
              empreendedores, publicado na Management Science) deu o resultado invertido.
              Quem já ia bem cresceu 15% usando IA. Quem ia mal <strong>piorou 8%</strong>.
            </p>
            <p className="p7-dim">
              O motivo, medido no estudo: a diferença não estava no conselho que a IA dava,
              estava no <strong>julgamento pra saber qual conselho implementar</strong>. A IA
              responde qualquer coisa com a mesma confiança. Quem não sabe separar o que
              funciona do que soa bonito, implementa o que soa bonito. E afunda mais rápido,
              só que agora com assinatura mensal.
            </p>
            <p className="p7-dim">
              Então o caminho tem duas partes, e todo mundo só te vende a primeira: as
              ferramentas, e o <strong>critério de quem já montou e tem número na mão</strong>.
              O Push Club é o segundo, com o primeiro dentro.
            </p>
          </div>
        </div>
      </section>

      {/* quem sou eu */}
      <section className="p7-sec">
        <div className="p7-wrap">
          <div className="p7-duo">
            <div>
              <span className="p7-eyebrow p7-r">Por que eu posso falar disso</span>
              <h2 className="p7-h2 p7-r">Eu sou o experimento. Com o faturamento aberto.</h2>
              <p className="p7-dim p7-r" style={{ marginTop: 18 }}>
                10 anos de mercado digital. Mais de 300 lançamentos analisados. Sócio de
                empresas que faturam milhões e que eu não posso virar de cabeça pra baixo
                pra testar IA. Então montei uma empresa separada pra isso: só eu e as IAs,
                nas horas vagas.
              </p>
              <p className="p7-dim p7-r">
                Hoje essa operação tem 10 assistentes rodando. Um responde meus alunos. Um
                cuida do dinheiro. Um garimpa leads nos meus comentários. Uma IA que eu
                configurei vendeu <strong>R$140 mil num lançamento</strong>. Noutro, R$300 mil.
                E o faturamento fica num painel aberto, que qualquer um pode conferir a
                qualquer hora.
              </p>
              <p className="p7-dim p7-r">
                No LinkedIn gringo já deram nome pro profissional que entrega o trabalho de
                três usando IA: <strong>Super IC</strong>. Eu acho que é só a primeira parada.
                O destino é o profissional que vira a empresa inteira: <strong>2 milhões de
                faturamento, 3 pessoas</strong>. Empresa enxuta, sem inchar time, sem virar
                refém de agência. É esse caminho que eu tô percorrendo em público, e é isso
                que o Club te entrega pronto pra copiar.
              </p>
            </div>
            <div className="p7-proofbox p7-r">
              <div className="p7-slot">Foto do Augusto</div>
              <div className="p7-slot">Print do painel de faturamento aberto</div>
            </div>
          </div>
        </div>
      </section>

      {/* o que tem dentro */}
      <section className="p7-sec">
        <div className="p7-wrap">
          <span className="p7-eyebrow p7-r">O que tem dentro</span>
          <h2 className="p7-h2 p7-r">Cada peça existe pra te mover na mesma direção.</h2>
          <p className="p7-dim p7-r" style={{ marginTop: 18, maxWidth: '62ch' }}>
            Isso aqui é a minha operação aberta, os arquivos dela e as pessoas montando junto:
          </p>
          <div className="p7-bento">
            <div className="p7-slot full p7-r">Loop mudo das aulas passando (webm, 8 a 12 segundos)<br />telas reais: IA de Vendas, Claude Code, Vibecode, Fundamentos</div>
            <div className="p7-card wide p7-r">
              <span className="tag">todo mês, ao vivo</span>
              <h3>Encontro mensal: a operação aberta</h3>
              <p>Eu abro o que montei no mês, com número e ferramenta na tela. O que deu dinheiro fica, o que não deu eu conto por quê. <strong>Você replica na semana seguinte.</strong></p>
            </div>
            <div className="p7-card p7-r">
              <span className="tag">catálogo completo</span>
              <h3>Todos os workshops</h3>
              <p>IA de Vendas no WhatsApp (20 aulas), Oficina Claude Code, Vibecode, IA Fundamentos. O que eu lançar entra sem custo. <strong>Entrou, tá tudo liberado.</strong></p>
            </div>
            <div className="p7-card p7-r">
              <span className="tag">copia e cola</span>
              <h3>A biblioteca de fluxos</h3>
              <p>Os JSONs do n8n que rodam a minha operação, os prompts, os templates. <strong>Você importa e adapta, não começa do zero.</strong></p>
            </div>
            <div className="p7-card p7-r">
              <span className="tag">24/7 no telegram</span>
              <h3>Claudinei, o agente do Club</h3>
              <p>Travou às 23h? Ele assistiu todas as aulas e te aponta o minuto exato. É também a prova de que isso funciona: <strong>você vai ser atendido por uma IA que eu montei.</strong></p>
            </div>
            <div className="p7-card p7-r">
              <span className="tag">direto comigo</span>
              <h3>Raio-X do seu negócio</h3>
              <p>Você conta onde trava, eu digo o que montaria primeiro e te aponto a peça da biblioteca pra começar. <strong>Critério aplicado no seu caso.</strong></p>
            </div>
            <div className="p7-card p7-r">
              <span className="tag">a turma</span>
              <h3>O grupo de quem tá montando</h3>
              <p>Donos de negócio e profissionais construindo as próprias operações enxutas. O que travou, o que rodou, o que deu dinheiro. <strong>É a troca que não existe no feed.</strong></p>
            </div>
          </div>
        </div>
      </section>

      {/* a turma */}
      <section className="p7-sec">
        <div className="p7-wrap">
          <div className="p7-duo rev">
            <div className="p7-r">
              <span className="p7-bignum">60%<small>do primeiro workshop entrou no Club no mesmo dia</small></span>
            </div>
            <div>
              <span className="p7-eyebrow p7-r">Quem já tá dentro</span>
              <h2 className="p7-h2 p7-r">Ninguém assinou por pitch. Assinaram porque viram rodando.</h2>
              <p className="p7-dim p7-r" style={{ marginTop: 18 }}>
                30 pessoas assistiram a primeira turma ao vivo. 6 em cada 10 entraram pro
                Club antes de acabar o dia, vendo o sistema funcionando na tela. Hoje a
                turma passa de 50 membros ativos.
              </p>
            </div>
          </div>
          <div className="p7-troop">
            <div className="p7-slot p7-r">Depoimento 1 (nome + foto + o que montou)</div>
            <div className="p7-slot p7-r">Depoimento 2</div>
            <div className="p7-slot p7-r">Depoimento 3 · em coleta no grupo</div>
          </div>
        </div>
      </section>

      {/* preço */}
      <section className="p7-sec" id="planos">
        <div className="p7-wrap">
          <span className="p7-eyebrow p7-r">Quanto custa</span>
          <h2 className="p7-h2 p7-r">O mesmo caminho, por outras portas:</h2>
          <div className="p7-anchor p7-r">
            <div className="p7-anchor-row"><span>implementação feita por mim</span><i /><span>R$15.000 + R$3.000/mês</span></div>
            <div className="p7-anchor-row"><span>mentoria individual</span><i /><span>R$10 a 15 mil por ano</span></div>
            <div className="p7-anchor-row"><span>cada workshop avulso</span><i /><span>R$200 a R$300</span></div>
            <div className="p7-anchor-row hot"><span>Push Club, tudo dentro, todo mês</span><i /><span>R$70/mês</span></div>
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
                <li>Raio-X do seu negócio</li>
              </ul>
              <a href={STRIPE_MENSAL} className="p7-pill ghost" data-checkout="mensal">assinar mensal</a>
            </div>
            <div className="p7-plan hot p7-r">
              <span className="p7-badge">mais escolhido · 2 meses grátis</span>
              <span className="name">anual</span>
              <div className="price">R$600<small>/ano</small></div>
              <span className="eq">= R$50/mês · economia de R$240</span>
              <ul>
                <li>Tudo do plano mensal</li>
                <li>Seu preço trava enquanto você ficar</li>
                <li>Prioridade nas turmas ao vivo</li>
              </ul>
              <a href={STRIPE_ANUAL} className="p7-pill" data-checkout="anual">assinar anual</a>
            </div>
          </div>

          <p className="p7-fine p7-r" style={{ marginBottom: 6 }}>
            <b>Sobre o preço:</b> ia ser R$150/mês. A primeira turma entrou por R$50, de
            fundador. Hoje é R$70 e a tabela só anda pra cima. Quem entra trava o preço
            enquanto ficar.
          </p>
          <p className="p7-fine p7-r">
            <b>Garantia?</b> Não tem. É R$70. Não gostou, cancela em 2 cliques, sem multa e
            sem ligação de retenção. Pagamento via Stripe, acesso imediato.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="p7-sec">
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
              <p>Se você quer colocar IA pra rodar no seu negócio, é. O IA Fundamentos te dá a base e o Claudinei segura tua mão às 23h. Se você quer só acompanhar notícia de IA, não é: aqui a régua é o que você montou.</p>
            </details>
            <details>
              <summary>O que exatamente eu recebo ao assinar?</summary>
              <p>Tudo, no dia 1: o encontro ao vivo do mês, os workshops gravados, o Claudinei, o grupo, a biblioteca de fluxos e o raio-x. O que for lançado depois entra sem custo adicional.</p>
            </details>
            <details>
              <summary>Posso cancelar quando quiser?</summary>
              <p>Sim. 2 cliques, sem multa. O acesso fica até o fim do período pago, e você volta quando quiser (pelo preço da tabela do dia).</p>
            </details>
            <details>
              <summary>Por que &ldquo;Push&rdquo;?</summary>
              <p>Push é empurrão. E quem é de tecnologia reconhece: push é o comando que publica seu trabalho no mundo. Lá dentro você usa os dois.</p>
            </details>
          </div>
        </div>
      </section>

      {/* final */}
      <section className="p7-final">
        <div className="p7-wrap">
          <span className="p7-eyebrow p7-r">O custo de esperar</span>
          <h2 className="p7-h2 p7-r">A conta continua rodando, com ou sem você.</h2>
          <p className="p7-sub p7-r" style={{ maxWidth: '52ch' }}>
            Daqui a 12 meses o seu mercado vai ter mais gente mediana operando com IA, e a
            distância entre eles e você vai ter mudado num sentido ou no outro. Essa é a
            única parte que é escolha sua.
          </p>
          <div className="p7-cta-row p7-r">
            <a href="#planos" className="p7-pill big">Entrar no Push Club</a>
            <span className="p7-cta-note">R$70/mês · sem fidelidade</span>
          </div>
        </div>
      </section>

      {/* trocador de rascunhos de hero (só existe no preview) */}
      <div className="p7-switch">
        <span>hero:</span>
        {Object.entries(HEADLINES).map(([k, v]) => (
          <a
            key={k}
            href={`?h=${k}${searchParams?.el ? `&el=${searchParams.el}` : ''}`}
            className={(searchParams?.h ?? '8') === k ? 'on' : ''}
            title={v.nota}
          >
            {k}
          </a>
        ))}
        <b>{head.nota}</b>
      </div>

      <footer className="p7-footer">
        <div className="p7-footer-in">
          <span>© {new Date().getFullYear()} Augusto Gobatto</span>
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
