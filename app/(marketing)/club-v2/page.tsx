import type { Metadata } from 'next'
import './v2.css'

export const metadata: Metadata = {
  title: 'Push Club — IA de verdade, colocando dinheiro no bolso',
  description:
    'Uma empresa onde só trabalha uma pessoa + IA — e você vendo tudo por dentro. Encontro ao vivo todo mês, todos os workshops, Claudinei 24/7 no Telegram, raio-x do seu negócio. R$70/mês, sem fidelidade.',
}

const STRIPE_MENSAL = 'https://buy.stripe.com/5kQ00k91qeVL2ve9JG9fW0f'
const STRIPE_ANUAL = 'https://buy.stripe.com/9B628s4La14Vb1KaNK9fW0g'

export default function ClubV2Page() {
  return (
    <div className="p2">
      <div className="p2-grain" aria-hidden="true" />

      {/* barra terminal com progresso de leitura */}
      <header className="p2-bar">
        <div className="p2-bar-in">
          <span className="p2-dots"><i /><i /><i /></span>
          <span className="p2-bar-cmd">
            augusto@ia-revolution:~$ <b>git push</b> club main
          </span>
          <a href="#planos" className="p2-bar-cta">entrar no club</a>
        </div>
        <span className="p2-progress" id="p2bar" />
      </header>

      <div className="p2-rail">
        {/* ═══ HERO ═══ */}
        <section className="p2-hero">
          <p className="p2-type">
            $ <b>iniciar operacao</b> --time=1_pessoa --ferramenta=ia --status=rodando
          </p>
          <h1 className="p2-h1">
            PUSH<span className="p2-cursor" />
            <span className="p2-club">CLUB</span>
          </h1>
          <div className="p2-hero-grid">
            <p className="p2-sub">
              <strong>Chega de falação sobre IA. Aqui você vê ela colocando
              dinheiro no bolso.</strong> Essa página? Feita por uma pessoa + IA.
              O robô que te atendeu? Também. Até o link de pagamento. O Push Club
              é esse experimento aberto — você vê por dentro e monta o seu.
            </p>
            <div className="p2-hero-cta">
              <a href="#planos" className="p2-btn">Entrar no Push Club →</a>
              <span className="p2-note">
                R$70/mês ou R$600/ano<br />sem fidelidade — cancela em 2 cliques
              </span>
            </div>
          </div>

          {/* ticker da operação */}
          <div className="p2-ticker" aria-hidden="true">
            <div className="p2-ticker-in">
              <span>
                R$140 mil vendidos por uma IA <i>✦</i> R$300 mil no lançamento seguinte <i>✦</i> 10 assistentes rodando agora <i>✦</i> 22 automações por dia <i>✦</i> 30 alunos no primeiro workshop <i>✦</i> 60% entraram pro club <i>✦</i> 0 programadores contratados <i>✦</i>
              </span>
              <span>
                R$140 mil vendidos por uma IA <i>✦</i> R$300 mil no lançamento seguinte <i>✦</i> 10 assistentes rodando agora <i>✦</i> 22 automações por dia <i>✦</i> 30 alunos no primeiro workshop <i>✦</i> 60% entraram pro club <i>✦</i> 0 programadores contratados <i>✦</i>
              </span>
            </div>
          </div>
        </section>

        {/* ═══ ATO 01 · O PROBLEMA ═══ */}
        <section className="p2-sec">
          <p className="p2-act p2-r"><b>ato 01</b> o problema</p>
          <h2 className="p2-h2 p2-r">Você não precisa de mais conteúdo. Precisa de uma IA rodando.</h2>
          <p className="p2-lede p2-r p2-r2">
            Todo mês uma ferramenta nova. Todo mundo falando. E no fim… nada
            rodando pra você. Compara aí:
          </p>
          <div className="p2-diff p2-r p2-r3">
            <div className="p2-diff-head">
              <span>sua-rotina.txt</span>
              <span>+3 −3</span>
            </div>
            <div className="p2-line ctx"><i>@</i><span>@@ os últimos 12 meses @@</span></div>
            <div className="p2-line del"><i>-</i><span>correr atrás do hype: aprende uma ferramenta, mês que vem apaga tudo e recomeça</span></div>
            <div className="p2-line del"><i>-</i><span>salvar vídeo, lotar o &ldquo;ver depois&rdquo; — e nenhuma IA trabalhando de verdade</span></div>
            <div className="p2-line del"><i>-</i><span>travar num erro às 23h e não ter ninguém pra perguntar</span></div>
            <div className="p2-line add"><i>+</i><span>uma IA atendendo e vendendo no seu WhatsApp — como a que já vendeu R$140 mil</span></div>
            <div className="p2-line add"><i>+</i><span>seus dados organizados e uma IA te mostrando onde está o dinheiro</span></div>
            <div className="p2-line add"><i>+</i><span>alguém que já fez, do seu lado, te falando: &ldquo;faz isso primeiro&rdquo;</span></div>
          </div>
        </section>

        {/* ═══ ATO 02 · O MECANISMO (pôster) ═══ */}
        <section className="p2-sec p2-manifesto">
          <p className="p2-act p2-r"><b>ato 02</b> por que você travou</p>
          <p className="p2-man-why p2-r">
            O motivo é simples: <strong>você aprende com quem fala de IA.</strong>{' '}
            Quem fala precisa de novidade toda semana. Quem opera precisa do que
            dá dinheiro.
          </p>
          <h2 className="p2-man-kill p2-r p2-r2">
            <span className="p2-dead">Você não compra aula.</span>
            <span className="p2-live">Você copia uma operação que roda.</span>
          </h2>
        </section>

        {/* ═══ ATO 03 · O EXPERIMENTO ═══ */}
        <section className="p2-sec">
          <p className="p2-act p2-r"><b>ato 03</b> o experimento</p>
          <h2 className="p2-h2 p2-r">Por que esse club existe.</h2>
          <div className="p2-dossier" style={{ marginTop: 'clamp(36px, 6vh, 56px)' }}>
            <div className="p2-photo p2-r">
              <span className="p2-stamp">Experimento nº 001 · em andamento</span>
              <img src="/gobatto.jpg" alt="Augusto Gobatto" />
              <span className="p2-photo-cap">Augusto Gobatto — 10 anos de mercado, +300 lançamentos analisados</span>
            </div>
            <div className="p2-story p2-r p2-r2">
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

        {/* ═══ ATO 04 · O QUE VOCÊ RECEBE (bento) ═══ */}
        <section className="p2-sec">
          <p className="p2-act p2-r"><b>ato 04</b> o que você recebe</p>
          <h2 className="p2-h2 p2-r">Entrou, tá tudo liberado.</h2>

          <div className="p2-bento p2-r p2-r2">
            <div className="p2-card feat">
              <span className="p2-tag">todo mês</span>
              <h3>Encontro ao vivo todo mês</h3>
              <p>
                Workshop denso ou mesa com a turma. O próximo: meu time de
                agentes de IA no Telegram — a estrutura que roda essa empresa,
                aberta na sua frente.
              </p>
            </div>
            <div className="p2-card">
              <span className="p2-tag">direto comigo</span>
              <h3>Raio-X do seu negócio</h3>
              <p>Você conta onde trava. Eu digo o que faria primeiro com IA — e já te entrego a automação pra começar.</p>
            </div>
            <div className="p2-card chat-card">
              <span className="p2-tag">24/7</span>
              <h3>Claudinei — o agente do Club</h3>
              <p>Travou às 23h? Ele assistiu todas as aulas, aponta o minuto exato e te manda o fluxo pronto.</p>
              <div className="p2-chat" aria-hidden="true">
                <div className="p2-chat-head">claudinei · online</div>
                <div className="p2-chat-body">
                  <div className="p2-msg me">travei na aula do WhatsApp… meu robô não responde 😤<span className="p2-msg-t">23:14</span></div>
                  <div className="p2-msg bot">Clássico — 9 em 10 vezes é a conexão que caiu. O Gobatto mostra aos 42min da aula 7. Me manda um print que eu já te falo.<span className="p2-msg-t">23:14</span></div>
                  <div className="p2-msg me">era isso kkkk voltou. valeu!<span className="p2-msg-t">23:19</span></div>
                  <div className="p2-typing"><i /><i /><i /></div>
                </div>
              </div>
            </div>
            <div className="p2-card half">
              <span className="p2-tag mut">catálogo completo</span>
              <h3>Todos os workshops, gravados</h3>
              <p>IA de Vendas no WhatsApp (20 aulas), Oficina Claude Code, Vendedor de IA, IA Fundamentos. O que lançar entra sozinho.</p>
            </div>
            <div className="p2-card half">
              <span className="p2-tag mut">copia e cola</span>
              <h3>Biblioteca de fluxos</h3>
              <p>Meus JSONs do n8n, prompts e templates. Copia, cola, roda.</p>
            </div>
            <div className="p2-card half">
              <span className="p2-tag mut">comunidade</span>
              <h3>Grupo do Club no Telegram</h3>
              <p>Acesso direto a mim e à galera que está montando junto.</p>
            </div>
          </div>

          <p className="p2-queue p2-r">
            <span className="g">já na fila dos próximos workshops</span>:<br />
            ⎇ <b>time de agentes no Telegram</b> — a estrutura que roda essa empresa<br />
            ⎇ <b>banco de dados + IA</b> — seus dados organizados, decisão na mão<br />
            ⎇ <b>assistente com cérebro</b> — memória de verdade, que aprende com você
          </p>
        </section>

        {/* ═══ ATO 05 · A PROVA ═══ */}
        <section className="p2-sec p2-proof">
          <p className="p2-act p2-r"><b>ato 05</b> a turma</p>
          <div className="p2-proof-grid">
            <div className="p2-bignum p2-r">
              60%
              <small>do primeiro workshop entrou no mesmo dia</small>
            </div>
            <div className="p2-proof-txt p2-r p2-r2">
              <h2 className="p2-h2" style={{ maxWidth: 'none' }}>Ninguém monta isso sozinho.</h2>
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

        {/* ═══ ATO 06 · O PREÇO ═══ */}
        <section className="p2-sec" id="planos">
          <p className="p2-act p2-r"><b>ato 06</b> quanto custa</p>
          <h2 className="p2-h2 p2-r">Menos que o estrago de mais um ano parado.</h2>

          <div className="p2-future p2-r p2-r2">
            <span>daqui a 90 dias</span>
            <p>
              O WhatsApp respondendo sozinho às 22h. Você no jantar, sem culpa.
              E o aviso de venda chegando no seu Telegram.
            </p>
          </div>

          <div className="p2-anchor p2-r">
            <div className="p2-anchor-row"><span>implementação feita por mim</span><i /><span>R$15.000 + R$3.000/mês</span></div>
            <div className="p2-anchor-row"><span>mentoria individual</span><i /><span>R$10 a 15 mil/ano</span></div>
            <div className="p2-anchor-row"><span>cada workshop avulso</span><i /><span>R$200 a R$300</span></div>
            <div className="p2-anchor-row hot"><span>Push Club — tudo dentro, todo mês</span><i /><span>R$70/mês</span></div>
          </div>

          <div className="p2-plans p2-r">
            <div className="p2-plan">
              <span className="p2-plan-name">mensal</span>
              <div className="p2-price">R$70<small>/mês</small></div>
              <ul>
                <li className="s">Encontro ao vivo todo mês</li>
                <li className="s">Todos os workshops gravados</li>
                <li className="s">Claudinei 24/7 + grupo no Telegram</li>
                <li>Raio-X do seu negócio</li>
                <li>Biblioteca de fluxos e templates</li>
                <li>Sem fidelidade — fica um mês se quiser</li>
              </ul>
              <a href={STRIPE_MENSAL} className="p2-plan-cta ghost">assinar mensal</a>
            </div>
            <div className="p2-plan hero">
              <span className="p2-badge">MAIS ESCOLHIDO · 2 MESES GRÁTIS</span>
              <span className="p2-plan-name">anual</span>
              <div className="p2-price">R$600<small>/ano</small></div>
              <span className="p2-eq">= R$50/mês · economia de R$240</span>
              <ul>
                <li className="s">Tudo do plano mensal</li>
                <li className="s">2 meses grátis</li>
                <li>Seu preço trava — enquanto você ficar, não sobe</li>
                <li>Prioridade nas turmas ao vivo</li>
              </ul>
              <a href={STRIPE_ANUAL} className="p2-plan-cta solid">assinar anual →</a>
            </div>
          </div>

          <div className="p2-pricenote p2-r">
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
          <p className="p2-fine">pagamento seguro via Stripe (aceita Apple Pay) · acesso imediato à área de membros</p>
        </section>

        {/* ═══ FAQ ═══ */}
        <section className="p2-sec">
          <p className="p2-act p2-r"><b>ato 07</b> dúvidas</p>
          <h2 className="p2-h2 p2-r">Perguntas frequentes</h2>
          <div className="p2-faq p2-r p2-r2">
            <details>
              <summary>Preciso saber programar?</summary>
              <p className="p2-faq-a">
                Não. Eu não sou programador — montei tudo isso conversando com a
                IA. A maior parte da turma é dono de negócio, não dev.
              </p>
            </details>
            <details>
              <summary>O que exatamente eu recebo ao assinar?</summary>
              <p className="p2-faq-a">
                Tudo, no dia 1: encontro ao vivo mensal, os 4 workshops gravados,
                o Claudinei 24/7, o grupo do Telegram, a biblioteca de fluxos e o
                raio-x do seu negócio. O que for lançado depois entra sem custo.
              </p>
            </details>
            <details>
              <summary>Sou iniciante total em IA. É pra mim?</summary>
              <p className="p2-faq-a">
                É — se você quer <em>colocar em prática</em>. O IA Fundamentos te
                dá a base e o Claudinei segura sua mão. Agora, se quer só
                acompanhar notícia de IA, esse não é o lugar.
              </p>
            </details>
            <details>
              <summary>Posso cancelar quando quiser?</summary>
              <p className="p2-faq-a">
                Sim. Sem fidelidade, sem multa. 2 cliques e pronto — o acesso
                fica até o fim do período pago.
              </p>
            </details>
            <details>
              <summary>Por que &ldquo;Push&rdquo;?</summary>
              <p className="p2-faq-a">
                Push é empurrão — o que separa quem assiste de quem faz. E quem é
                de tecnologia reconhece: <code>push</code> é o comando que
                publica seu trabalho no mundo. Lá dentro você usa os dois.
              </p>
            </details>
          </div>
        </section>
      </div>

      {/* ═══ FINAL ═══ */}
      <section className="p2-final">
        <span className="p2-ghost" aria-hidden="true">PUSH</span>
        <p className="p2-final-cmd p2-r">
          daqui a 12 meses você vai ter <b>IAs rodando</b> — ou mais um ano de vídeo assistido
        </p>
        <h2 className="p2-final-h p2-r">
          Falta só<br /><em>o empurrão.</em><span className="p2-cursor p2-cursor-sm" />
        </h2>
        <a href="#planos" className="p2-btn p2-r">Entrar no Push Club →</a>
        <p className="p2-alt p2-r">
          Ainda não tá pronto? Começa pelo <a href="/members/login">IA Fundamentos</a> — curso grátis, na mesma plataforma.
        </p>
      </section>

      <div className="p2-rail">
        <footer className="p2-footer">
          <span>© {new Date().getFullYear()} IA Revolution · Augusto Gobatto</span>
          <a href="/privacidade">privacidade</a>
        </footer>
      </div>

      {/* progresso + reveals */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){
var bar=document.getElementById('p2bar');
function up(){var h=document.documentElement;var m=h.scrollHeight-h.clientHeight;bar.style.transform='scaleX('+(m>0?h.scrollTop/m:0)+')'}
addEventListener('scroll',up,{passive:true});up();
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:0.12});
document.querySelectorAll('.p2-r').forEach(function(el){io.observe(el)});
})();`,
        }}
      />
    </div>
  )
}
