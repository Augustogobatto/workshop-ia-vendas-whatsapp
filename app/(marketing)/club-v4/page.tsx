import type { Metadata } from 'next'
import './v4.css'

export const metadata: Metadata = {
  title: 'Push Club — IA de verdade, colocando dinheiro no bolso',
  description:
    'Uma empresa onde só trabalha uma pessoa + IA — e você vendo tudo por dentro. Encontro ao vivo todo mês, todos os workshops, Claudinei 24/7 no Telegram, raio-x do seu negócio. R$70/mês, sem fidelidade.',
}

const STRIPE_MENSAL = 'https://buy.stripe.com/5kQ00k91qeVL2ve9JG9fW0f'
const STRIPE_ANUAL = 'https://buy.stripe.com/9B628s4La14Vb1KaNK9fW0g'

export default function ClubV4Page() {
  return (
    <div className="p4">
      {/* nav */}
      <header className="p4-nav">
        <div className="p4-nav-in">
          <a href="#" className="p4-logo">push<b>club</b></a>
          <a href="#planos" className="p4-nav-cta">Entrar no Club</a>
        </div>
        <span className="p4-progress" id="p4bar" />
      </header>

      <div className="p4-rail">
        {/* ═══ HERO ═══ */}
        <section className="p4-hero">
          <span className="p4-badge-live">experimento nº 001 · operação ao vivo</span>
          <h1 className="p4-h1">
            Chega de falação.<br />
            <span className="g">Veja a IA dando dinheiro.</span>
          </h1>
          <p className="p4-sub">
            <strong>Uma empresa onde só trabalha uma pessoa + IA.</strong> Essa
            página? Feita assim. O robô que te atendeu? Também. Até o link de
            pagamento. O Push Club é esse experimento aberto — você vê por dentro
            e monta o seu.
          </p>
          <div className="p4-hero-ctas">
            <a href="#planos" className="p4-btn">Entrar no Push Club</a>
            <a href="#experimento" className="p4-btn-ghost">Ver o experimento ↓</a>
          </div>
          <p className="p4-hero-note">R$70/mês ou R$600/ano · sem fidelidade · cancela em 2 cliques</p>

          <div className="p4-stats">
            <div className="p4-stat"><b>R$140 mil</b><span>vendidos por uma IA</span></div>
            <div className="p4-stat"><b>10</b><span>assistentes rodando agora</span></div>
            <div className="p4-stat"><b>60%</b><span>do workshop entrou pro Club</span></div>
            <div className="p4-stat"><b>0</b><span>programadores contratados</span></div>
          </div>
        </section>

        <hr className="p4-hr" />

        {/* ═══ ATO 01 · O PROBLEMA ═══ */}
        <section className="p4-sec">
          <p className="p4-act p4-r"><b>01</b> o problema</p>
          <h2 className="p4-h2 p4-r">Você não precisa de mais conteúdo. Precisa de uma IA rodando.</h2>
          <p className="p4-lede p4-r p4-r2">
            Todo mês uma ferramenta nova. Todo mundo falando. E no fim… nada
            rodando pra você. Compara aí:
          </p>
          <div className="p4-diff p4-r p4-r3">
            <div className="p4-diff-head">
              <span className="dots"><i /><i /><i /></span>
              <span>sua-rotina.txt</span>
              <span className="plus">+3 −3</span>
            </div>
            <div className="p4-line ctx"><i>@</i><span>os últimos 12 meses</span></div>
            <div className="p4-line del"><i>−</i><span>correr atrás do hype: aprende uma ferramenta, mês que vem apaga tudo e recomeça</span></div>
            <div className="p4-line del"><i>−</i><span>salvar vídeo, lotar o &ldquo;ver depois&rdquo; — e nenhuma IA trabalhando de verdade</span></div>
            <div className="p4-line del"><i>−</i><span>travar num erro às 23h e não ter ninguém pra perguntar</span></div>
            <div className="p4-line add"><i>+</i><span>uma IA atendendo e vendendo no seu WhatsApp — como a que já vendeu R$140 mil</span></div>
            <div className="p4-line add"><i>+</i><span>seus dados organizados e uma IA te mostrando onde está o dinheiro</span></div>
            <div className="p4-line add"><i>+</i><span>alguém que já fez, do seu lado, te falando: &ldquo;faz isso primeiro&rdquo;</span></div>
          </div>
        </section>

        <hr className="p4-hr" />

        {/* ═══ ATO 02 · MANIFESTO ═══ */}
        <section className="p4-sec p4-manifesto p4-center">
          <p className="p4-act p4-r" style={{ alignSelf: 'center' }}><b>02</b> por que você travou</p>
          <p className="p4-why p4-r">
            O motivo é simples: <strong>você aprende com quem fala de IA.</strong>{' '}
            Quem fala precisa de novidade toda semana. Quem opera precisa do que
            dá dinheiro.
          </p>
          <h2 className="p4-kill p4-r p4-r2">
            <span className="dead">Você não compra aula.</span>
            <span className="live">Você copia uma <em>operação que roda</em>.</span>
          </h2>
        </section>

        <hr className="p4-hr" />

        {/* ═══ ATO 03 · O EXPERIMENTO ═══ */}
        <section className="p4-sec" id="experimento">
          <p className="p4-act p4-r"><b>03</b> o experimento</p>
          <h2 className="p4-h2 p4-r">Por que esse club existe.</h2>
          <div className="p4-dossier">
            <div className="p4-photo p4-r">
              <span className="p4-photo-tag">experimento nº 001</span>
              <img src="/gobatto.jpg" alt="Augusto Gobatto" />
              <span className="p4-photo-cap">Augusto Gobatto — 10 anos de mercado, +300 lançamentos analisados</span>
            </div>
            <div className="p4-story p4-r p4-r2">
              <p>
                10 anos de mercado. Mais de 300 lançamentos analisados. Sócio de
                empresas que faturam milhões. E eu <strong>não posso</strong>{' '}
                virar essas empresas de cabeça pra baixo pra testar IA.
              </p>
              <p>
                Então montei um laboratório: <strong>uma empresa onde só trabalha
                eu + IA</strong>. Nas horas vagas. Em 2 meses, 10 assistentes
                rodando. Um vende. Um cuida do dinheiro. Um te atende aqui. E uma
                IA que eu configurei já vendeu <strong>R$140 mil num
                lançamento</strong>. Noutro, R$300 mil.
              </p>
              <p>
                Pra mim, IA é máquina de lavar louça: tenho uma porque prefiro
                viver a vida. Meu plano? Praia, cachorro, noiva —{' '}
                <em>e as vendas entrando</em>.
              </p>
              <p>
                No Push Club você vê esse experimento por dentro. Eu testo,
                valido e te mostro <strong>com número e ferramenta na mão</strong>.
                Você replica. Se eu não validei, você não me vê falando.
              </p>
            </div>
          </div>
        </section>

        <hr className="p4-hr" />

        {/* ═══ ATO 04 · O QUE VOCÊ RECEBE ═══ */}
        <section className="p4-sec">
          <p className="p4-act p4-r"><b>04</b> o que você recebe</p>
          <h2 className="p4-h2 p4-r">Entrou, tá tudo liberado.</h2>

          <div className="p4-bento p4-r p4-r2">
            <div className="p4-card feat">
              <span className="p4-tag">todo mês</span>
              <h3>Encontro ao vivo todo mês</h3>
              <p>
                Workshop denso ou mesa com a turma. O próximo: meu time de
                agentes de IA no Telegram — a estrutura que roda essa empresa,
                aberta na sua frente.
              </p>
            </div>
            <div className="p4-card">
              <span className="p4-tag">direto comigo</span>
              <h3>Raio-X do seu negócio</h3>
              <p>Você conta onde trava. Eu digo o que faria primeiro com IA — e já te entrego a automação pra começar.</p>
            </div>
            <div className="p4-card chat-card">
              <span className="p4-tag">24/7</span>
              <h3>Claudinei — o agente do Club</h3>
              <p>Travou às 23h? Ele assistiu todas as aulas, aponta o minuto exato e te manda o fluxo pronto.</p>
              <div className="p4-chat" aria-hidden="true">
                <div className="p4-chat-head">claudinei · online</div>
                <div className="p4-chat-body">
                  <div className="p4-msg me">travei na aula do WhatsApp… meu robô não responde 😤<span className="p4-msg-t">23:14</span></div>
                  <div className="p4-msg bot">Clássico — 9 em 10 vezes é a conexão que caiu. O Gobatto mostra aos 42min da aula 7. Me manda um print que eu já te falo.<span className="p4-msg-t">23:14</span></div>
                  <div className="p4-msg me">era isso kkkk voltou. valeu!<span className="p4-msg-t">23:19</span></div>
                  <div className="p4-typing"><i /><i /><i /></div>
                </div>
              </div>
            </div>
            <div className="p4-card half">
              <span className="p4-tag mut">catálogo completo</span>
              <h3>Todos os workshops, gravados</h3>
              <p>IA de Vendas no WhatsApp (20 aulas), Oficina Claude Code, Vendedor de IA, IA Fundamentos. O que lançar entra sozinho.</p>
            </div>
            <div className="p4-card half">
              <span className="p4-tag mut">copia e cola</span>
              <h3>Biblioteca de fluxos</h3>
              <p>Meus JSONs do n8n, prompts e templates. Copia, cola, roda.</p>
            </div>
            <div className="p4-card half">
              <span className="p4-tag mut">comunidade</span>
              <h3>Grupo do Club no Telegram</h3>
              <p>Acesso direto a mim e à galera que está montando junto.</p>
            </div>
          </div>

          <p className="p4-queue p4-r">
            <span className="g">Já na fila dos próximos workshops:</span>{' '}
            <b>time de agentes no Telegram</b> · <b>banco de dados + IA</b> ·{' '}
            <b>assistente com cérebro</b>
          </p>
        </section>

        <hr className="p4-hr" />

        {/* ═══ ATO 05 · A PROVA ═══ */}
        <section className="p4-sec">
          <p className="p4-act p4-r"><b>05</b> a turma</p>
          <div className="p4-proof-grid">
            <div className="p4-bignum p4-r">
              60%
              <small>do primeiro workshop entrou no mesmo dia</small>
            </div>
            <div className="p4-proof-txt p4-r p4-r2">
              <h2>Ninguém monta isso sozinho.</h2>
              <p>
                O primeiro workshop teve 30 alunos.{' '}
                <strong>6 em cada 10 entraram pro Club no mesmo dia.</strong> Não
                porque eu pressionei. Porque viram funcionando ao vivo.
              </p>
              <p>
                É esse o grupo: gente montando de verdade. Mostrando o que
                travou, o que rodou, o que deu dinheiro. Num lugar assim é
                impossível ficar parado.
              </p>
            </div>
          </div>
        </section>

        <hr className="p4-hr" />

        {/* ═══ ATO 06 · O PREÇO ═══ */}
        <section className="p4-sec p4-center" id="planos" style={{ textAlign: 'center' }}>
          <p className="p4-act p4-r"><b>06</b> quanto custa</p>
          <h2 className="p4-h2 p4-r" style={{ maxWidth: 'none' }}>Menos que o estrago de mais um ano parado.</h2>

          <div className="p4-future p4-r p4-r2">
            <span>daqui a 90 dias</span>
            <p>
              O WhatsApp respondendo sozinho às 22h. Você no jantar, sem culpa.
              E o aviso de venda chegando no seu Telegram.
            </p>
          </div>

          <div className="p4-anchor p4-r" style={{ textAlign: 'left' }}>
            <div className="p4-anchor-row"><span>implementação feita por mim</span><i /><span>R$15.000 + R$3.000/mês</span></div>
            <div className="p4-anchor-row"><span>mentoria individual</span><i /><span>R$10 a 15 mil/ano</span></div>
            <div className="p4-anchor-row"><span>cada workshop avulso</span><i /><span>R$200 a R$300</span></div>
            <div className="p4-anchor-row hot"><span>Push Club — tudo dentro, todo mês</span><i /><span>R$70/mês</span></div>
          </div>

          <div className="p4-plans p4-r" style={{ textAlign: 'left' }}>
            <div className="p4-plan">
              <span className="p4-plan-name">mensal</span>
              <div className="p4-price">R$70<small>/mês</small></div>
              <ul>
                <li className="s">Encontro ao vivo todo mês</li>
                <li className="s">Todos os workshops gravados</li>
                <li className="s">Claudinei 24/7 + grupo no Telegram</li>
                <li>Raio-X do seu negócio</li>
                <li>Biblioteca de fluxos e templates</li>
                <li>Sem fidelidade — fica um mês se quiser</li>
              </ul>
              <a href={STRIPE_MENSAL} className="p4-plan-cta ghost">Assinar mensal</a>
            </div>
            <div className="p4-plan hero">
              <span className="p4-badge">MAIS ESCOLHIDO · 2 MESES GRÁTIS</span>
              <span className="p4-plan-name">anual</span>
              <div className="p4-price">R$600<small>/ano</small></div>
              <span className="p4-eq">= R$50/mês · economia de R$240</span>
              <ul>
                <li className="s">Tudo do plano mensal</li>
                <li className="s">2 meses grátis</li>
                <li>Seu preço trava — enquanto você ficar, não sobe</li>
                <li>Prioridade nas turmas ao vivo</li>
              </ul>
              <a href={STRIPE_ANUAL} className="p4-plan-cta solid">Assinar anual →</a>
            </div>
          </div>

          <div className="p4-pricenote p4-r">
            <p>
              <b>Sobre o preço:</b> ia ser R$150/mês. A primeira turma entrou por
              R$50, de fundador. Hoje é R$70 — e a tabela só anda pra cima.{' '}
              <b>Quem entra trava o preço enquanto ficar.</b>
            </p>
            <p>
              <b>Garantia?</b> Não tem. É R$70. Não gostou? Cancela em 2 cliques.
              Sem multa, sem ligação de retenção. Sai e volta quando quiser.
            </p>
          </div>
          <p className="p4-fine">pagamento seguro via Stripe (aceita Apple Pay) · acesso imediato à área de membros</p>
        </section>

        <hr className="p4-hr" />

        {/* ═══ FAQ ═══ */}
        <section className="p4-sec">
          <p className="p4-act p4-r"><b>07</b> dúvidas</p>
          <h2 className="p4-h2 p4-r">Perguntas frequentes</h2>
          <div className="p4-faq p4-r p4-r2">
            <details>
              <summary>Preciso saber programar?</summary>
              <p className="p4-faq-a">
                Não. Eu não sou programador — montei tudo isso conversando com a
                IA. A maior parte da turma é dono de negócio, não dev.
              </p>
            </details>
            <details>
              <summary>O que exatamente eu recebo ao assinar?</summary>
              <p className="p4-faq-a">
                Tudo, no dia 1: encontro ao vivo mensal, os 4 workshops gravados,
                o Claudinei 24/7, o grupo do Telegram, a biblioteca de fluxos e o
                raio-x do seu negócio. O que for lançado depois entra sem custo.
              </p>
            </details>
            <details>
              <summary>Sou iniciante total em IA. É pra mim?</summary>
              <p className="p4-faq-a">
                É — se você quer <em>colocar em prática</em>. O IA Fundamentos te
                dá a base e o Claudinei segura sua mão. Agora, se quer só
                acompanhar notícia de IA, esse não é o lugar.
              </p>
            </details>
            <details>
              <summary>Posso cancelar quando quiser?</summary>
              <p className="p4-faq-a">
                Sim. Sem fidelidade, sem multa. 2 cliques e pronto — o acesso
                fica até o fim do período pago.
              </p>
            </details>
            <details>
              <summary>Por que &ldquo;Push&rdquo;?</summary>
              <p className="p4-faq-a">
                Push é empurrão — o que separa quem assiste de quem faz. E quem é
                de tecnologia reconhece: <code>push</code> é o comando que
                publica seu trabalho no mundo. Lá dentro você usa os dois.
              </p>
            </details>
          </div>
        </section>
      </div>

      {/* ═══ FINAL ═══ */}
      <section className="p4-final">
        <span className="p4-ghost" aria-hidden="true">PUSH</span>
        <p className="p4-final-cmd p4-r">
          daqui a 12 meses você vai ter <b>IAs rodando</b> — ou mais um ano de vídeo assistido
        </p>
        <h2 className="p4-final-h p4-r">
          Falta só<br /><em>o empurrão.</em>
        </h2>
        <a href="#planos" className="p4-btn p4-r">Entrar no Push Club</a>
        <p className="p4-alt p4-r">
          Ainda não tá pronto? Começa pelo <a href="/members/login">IA Fundamentos</a> — curso grátis, na mesma plataforma.
        </p>
      </section>

      <footer className="p4-footer">
        <div className="p4-footer-in">
          <span>© {new Date().getFullYear()} IA Revolution · Augusto Gobatto</span>
          <a href="/privacidade">privacidade</a>
        </div>
      </footer>

      {/* progresso + reveals + glow follow */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){
var bar=document.getElementById('p4bar');
function up(){var h=document.documentElement;var m=h.scrollHeight-h.clientHeight;bar.style.transform='scaleX('+(m>0?h.scrollTop/m:0)+')'}
addEventListener('scroll',up,{passive:true});up();
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:0.12});
document.querySelectorAll('.p4-r').forEach(function(el){io.observe(el)});
document.querySelectorAll('.p4-card').forEach(function(c){c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px')})});
})();`,
        }}
      />
    </div>
  )
}
