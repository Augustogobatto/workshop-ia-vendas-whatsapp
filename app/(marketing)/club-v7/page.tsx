import type { Metadata } from 'next'
import './v7.css'

export const metadata: Metadata = {
  title: 'Push Club — gente pior que você, com IA, vai te superar',
  description:
    'Harvard mediu: profissionais medianos com IA ganharam 43% de desempenho. O Push Club é as peças validadas e o critério de quem já montou, por R$70/mês.',
  robots: { index: false, follow: false }, // preview: liberar indexação só quando assumir a /club
}

const STRIPE_MENSAL = 'https://buy.stripe.com/5kQ00k91qeVL2ve9JG9fW0f'
const STRIPE_ANUAL = 'https://buy.stripe.com/9B628s4La14Vb1KaNK9fW0g'

const HERO_ELEMENTS: Record<string, { src: string; alt: string }> = {
  '1': { src: '/club-v7/el1.jpg', alt: 'Esfera de granito na quina de um plinto, um instante antes de cair' },
  '3': { src: '/club-v7/el3.jpg', alt: 'Bloco de granito erguido por uma alavanca fina de aço' },
  '4': { src: '/club-v7/el4.jpg', alt: 'Bloco de pedra metade bruto, metade esculpido em cunha polida' },
}

export default function ClubV7Page({
  searchParams,
}: {
  searchParams?: { el?: string }
}) {
  const hero = HERO_ELEMENTS[searchParams?.el ?? '1'] ?? HERO_ELEMENTS['1']
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
              <h1 className="p7-h1 p7-r">Gente pior que você, com IA, <em>vai te superar.</em></h1>
              <p className="p7-sub p7-r">
                Harvard mediu: com IA, o profissional mediano já passa quem não usa.
                O Push Club te deixa do lado certo dessa conta.
              </p>
              <div className="p7-cta-row p7-r">
                <a href="#planos" className="p7-pill big">Entrar no Push Club</a>
                <span className="p7-cta-note">R$70/mês · sem fidelidade</span>
              </div>
            </div>
            <div className="p7-hero-el p7-r">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={hero.src} alt={hero.alt} className="p7-hero-img" />
            </div>
          </div>
        </div>
      </section>

      {/* faixa de fatos */}
      <div className="p7-facts">
        <div className="p7-facts-in">
          <span>R$140 mil vendidos por uma IA</span>
          <span>10 assistentes rodando</span>
          <span>50+ membros ativos</span>
          <span>faturamento em painel aberto</span>
        </div>
      </div>

      {/* a conta */}
      <section className="p7-sec">
        <div className="p7-wrap">
          <div className="p7-duo">
            <div>
              <span className="p7-eyebrow p7-r">A conta que ninguém te mostrou</span>
              <h2 className="p7-h2 p7-r">A IA nivela o jogo. A pergunta é pra qual lado você fica.</h2>
              <p className="p7-dim p7-r" style={{ marginTop: 18 }}>
                Três estudos, com milhares de pessoas, mediram a mesma coisa em áreas
                diferentes. O conhecimento que te diferenciava virou commodity: o
                atendente novato alcança o veterano em dois meses porque a IA destilou
                o que o veterano sabia e entregou de graça pro resto da fila.
              </p>
              <p className="p7-dim p7-r">
                A vantagem que você levou anos construindo, alguém mediano aluga por
                20 dólares por mês. Isso já aconteceu com consultor, com atendente,
                com programador. Vai acontecer no seu mercado, com o seu concorrente.
              </p>
            </div>
            <div className="p7-stats p7-r">
              <div className="p7-stat">
                <span className="n">+43%</span>
                <span className="l">de desempenho pros profissionais medianos com IA. Os melhores: +17%. (Harvard/BCG, 758 consultores)</span>
              </div>
              <div className="p7-stat">
                <span className="n">2 meses</span>
                <span className="l">pra um novato com IA alcançar quem tinha 6 meses de experiência. (QJE, 5.179 atendentes)</span>
              </div>
              <div className="p7-stat">
                <span className="n">0,69 → 0,52</span>
                <span className="l">quanto ser &ldquo;bom&rdquo; passou a prever o resultado final do trabalho. (Science, 453 profissionais)</span>
              </div>
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
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:0.1});
document.querySelectorAll('.p7-r').forEach(function(el){io.observe(el)});
})();`,
        }}
      />
    </div>
  )
}
