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
          <p className="p7-hero-epi p7-r">
            &ldquo;Dê-me um ponto de apoio e uma alavanca, e moverei o mundo.&rdquo;{' '}
            <span className="a">Arquimedes</span>
          </p>
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
      <section className="p7-stage" id="entenda">
        <div className="p7-wrap">
          <h2 className="p7-h2 p7-r" style={{ maxWidth: '30ch' }}>
            A alavanca todo mundo ganhou.<br />O ponto de apoio, ninguém deu.
          </h2>
          <div className="p7-measure p7-r">
            <p className="p7-dim">
              Abrir o ChatGPT e perguntar se vai chover amanhã também é usar IA. É o uso
              que te venderam. Funciona. Só levanta um peso ridículo perto do que a
              ferramenta aguenta.
            </p>
          </div>
        </div>
      </section>

      {/* onde apoiar — PROVA VISUAL, copy de rascunho pro Augusto reescrever */}
      <section className="p7-sec">
        <div className="p7-wrap">
          <h2 className="p7-h2 p7-r">Na prática, IA que funciona:</h2>
          <div className="p7-ledger p7-r">
            <div className="p7-led-row">
              <h3 className="p7-pilar">Traz dinheiro.</h3>
              <div className="p7-led-exs">
                <p className="p7-dim"><strong>R$300 mil</strong> · vendidos pela IA que atende meu WhatsApp.</p>
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
        </div>
      </section>


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
