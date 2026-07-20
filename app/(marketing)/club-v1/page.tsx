import type { Metadata } from 'next'
import './club.css'

export const metadata: Metadata = {
  title: 'Push Club — IA de verdade, colocando dinheiro no bolso',
  description:
    'Uma empresa onde só trabalha uma pessoa + IA — e você vendo tudo por dentro. Aula ao vivo todo mês, todos os workshops, Claudinei 24/7 no Telegram, raio-x do seu negócio. R$70/mês, sem fidelidade.',
}

const STRIPE_MENSAL = 'https://buy.stripe.com/5kQ00k91qeVL2ve9JG9fW0f'
const STRIPE_ANUAL = 'https://buy.stripe.com/9B628s4La14Vb1KaNK9fW0g'

export default function ClubPage() {
  return (
    <div className="pc">
      <div className="pc-grain" aria-hidden="true" />
      {/* barra de terminal */}
      <header className="pc-bar">
        <div className="pc-bar-in">
          <span className="pc-dots"><i /><i /><i /></span>
          <span className="pc-bar-cmd">
            augusto@ia-revolution:~$ <b>git push</b> club main
          </span>
          <a href="#planos" className="pc-bar-cta">entrar no club</a>
        </div>
      </header>

      <div className="pc-wrap">
        {/* ── HERO ── */}
        <section className="pc-hero">
          <p className="pc-kicker fade-up">
            uma empresa onde só trabalha <b>uma pessoa + IA</b> — e você vendo tudo por dentro
          </p>
          <h1 className="pc-h1 fade-up fade-up-1">
            PUSH<span className="pc-cursor" />
            <span className="pc-club">CLUB</span>
          </h1>
          <p className="pc-sub fade-up fade-up-2">
            <strong>Chega de falação sobre IA. Aqui você vê ela colocando dinheiro no bolso.</strong>{' '}
            <span className="pc-dim">
              Essa página? Feita por uma pessoa + IA. O robô que te atendeu? Também.
              Até o link de pagamento. Sem equipe, sem programador. O Push Club é
              esse experimento aberto — você vê por dentro e monta o seu.
            </span>
          </p>
          <div className="pc-hero-cta fade-up fade-up-3">
            <a href="#planos" className="pc-btn">
              Entrar no Push Club →
            </a>
            <span className="pc-hero-note">
              R$70/mês ou R$600/ano<br />sem fidelidade — cancela em 2 cliques
            </span>
          </div>
        </section>

        {/* ── TICKER DA OPERAÇÃO ── */}
        <div className="pc-ticker pc-bleed" aria-hidden="true">
          <div className="pc-ticker-in">
            <span>
              R$140 mil vendidos por uma IA <i>✦</i> R$300 mil no lançamento seguinte <i>✦</i> 10 assistentes rodando agora <i>✦</i> 22 automações por dia <i>✦</i> 30 alunos no primeiro workshop <i>✦</i> 60% entraram pro club <i>✦</i> 0 programadores contratados <i>✦</i>
            </span>
            <span>
              R$140 mil vendidos por uma IA <i>✦</i> R$300 mil no lançamento seguinte <i>✦</i> 10 assistentes rodando agora <i>✦</i> 22 automações por dia <i>✦</i> 30 alunos no primeiro workshop <i>✦</i> 60% entraram pro club <i>✦</i> 0 programadores contratados <i>✦</i>
            </span>
          </div>
        </div>

        {/* ── DIFF ── */}
        <section className="pc-sec">
          <p className="pc-label pc-r">o problema</p>
          <h2 className="pc-h2 pc-r">
            Você não precisa de mais conteúdo. Precisa de uma IA rodando.
          </h2>
          <p className="pc-sec-sub pc-r">
            Todo mês uma ferramenta nova. Todo mundo falando. E no fim… nada
            rodando pra você. Compara aí:
          </p>
          <div className="pc-diff pc-r">
            <div className="pc-diff-head">
              <span>sua-rotina.txt</span>
              <span>+3 −3</span>
            </div>
            <div className="pc-line ctx"><i>@</i><span>@@ os últimos 12 meses @@</span></div>
            <div className="pc-line del"><i>-</i><span>correr atrás do hype: aprende uma ferramenta, mês que vem apaga tudo e recomeça</span></div>
            <div className="pc-line del"><i>-</i><span>salvar vídeo, lotar o &ldquo;ver depois&rdquo; — e nenhuma IA trabalhando de verdade</span></div>
            <div className="pc-line del"><i>-</i><span>travar num erro às 23h e não ter ninguém pra perguntar</span></div>
            <div className="pc-line add"><i>+</i><span>uma IA atendendo e vendendo no seu WhatsApp — como a que já vendeu R$140 mil</span></div>
            <div className="pc-line add"><i>+</i><span>seus dados organizados e uma IA te mostrando onde está o dinheiro</span></div>
            <div className="pc-line add"><i>+</i><span>alguém que já fez, do seu lado, te falando: &ldquo;faz isso primeiro&rdquo;</span></div>
          </div>
          <div className="pc-punch pc-r">
            <p>
              E o motivo de você estar travado é simples: <strong>você aprende com
              quem fala de IA.</strong> Quem fala precisa de novidade toda semana.
              Quem opera precisa do que dá dinheiro.
            </p>
            <p className="pc-punch-line">
              Aqui você não compra aula. <em>Você copia uma operação que roda.</em>
            </p>
          </div>
        </section>

        {/* ── O EXPERIMENTO ── */}
        <section className="pc-sec">
          <p className="pc-label pc-r">o experimento</p>
          <h2 className="pc-h2 pc-r">Por que esse club existe.</h2>
          <div className="pc-duo" style={{ marginTop: 40 }}>
            <div className="pc-story-img pc-r">
              <span className="pc-stamp">Experimento nº 001 · em andamento</span>
              <img src="/gobatto.jpg" alt="Augusto Gobatto" />
              <span className="pc-story-caption">Augusto Gobatto — 10 anos de mercado, +300 lançamentos analisados</span>
            </div>
            <div className="pc-story-txt pc-r">
              <p>
                10 anos de mercado. Mais de 300 lançamentos analisados. Sócio de
                empresas que faturam milhões. E eu <strong>não posso</strong> virar
                essas empresas de cabeça pra baixo pra testar IA.
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
                No Push Club você vê esse experimento por dentro. Eu testo, valido
                e te mostro <strong>com número e ferramenta na mão</strong>. Você
                replica. Se eu não validei, você não me vê falando.
              </p>
            </div>
          </div>
        </section>

        {/* ── ENTREGÁVEIS ── */}
        <section className="pc-sec">
          <p className="pc-label pc-r">o que você recebe</p>
          <h2 className="pc-h2 pc-r">Entrou, tá tudo liberado.</h2>

          <div className="pc-log pc-r">
            <div className="pc-commit">
              <span className="pc-hash">a1f2e9c</span>
              <div className="pc-commit-msg">
                <b>Encontro ao vivo todo mês</b>
                <span>Workshop denso ou mesa com a turma. O próximo: meu time de agentes de IA no Telegram.</span>
              </div>
              <span className="pc-tag hot">todo mês</span>
            </div>
            <div className="pc-commit">
              <span className="pc-hash">7d3b0aa</span>
              <div className="pc-commit-msg">
                <b>Raio-X do seu negócio</b>
                <span>Você conta onde trava. Eu digo o que faria primeiro com IA — e já te entrego a automação pra começar.</span>
              </div>
              <span className="pc-tag hot">direto comigo</span>
            </div>
            <div className="pc-commit">
              <span className="pc-hash">c4e8f21</span>
              <div className="pc-commit-msg">
                <b>Todos os workshops, gravados</b>
                <span>IA de Vendas no WhatsApp (20 aulas), Oficina Claude Code, Vendedor de IA, IA Fundamentos. O que lançar entra sozinho.</span>
              </div>
              <span className="pc-tag">catálogo completo</span>
            </div>
            <div className="pc-commit">
              <span className="pc-hash">e9a04d7</span>
              <div className="pc-commit-msg">
                <b>Claudinei — 24h no seu Telegram</b>
                <span>Travou? Ele aponta o minuto exato da aula e te manda o fluxo pronto.</span>
              </div>
              <span className="pc-tag hot">24/7</span>
            </div>
            <div className="pc-commit">
              <span className="pc-hash">f0b661d</span>
              <div className="pc-commit-msg">
                <b>Biblioteca de fluxos e templates</b>
                <span>Meus JSONs do n8n, prompts e templates. Copia, cola, roda.</span>
              </div>
              <span className="pc-tag">copia e cola</span>
            </div>
            <div className="pc-commit">
              <span className="pc-hash">b3d97e2</span>
              <div className="pc-commit-msg">
                <b>Grupo do Club no Telegram</b>
                <span>Acesso direto a mim e à galera que está montando junto.</span>
              </div>
              <span className="pc-tag">comunidade</span>
            </div>
          </div>

          <div className="pc-branches pc-r">
            <span className="pc-b-green">já na fila dos próximos workshops</span>:<br />
            ⎇ <b>time de agentes no Telegram</b> — a estrutura que roda essa empresa<br />
            ⎇ <b>banco de dados + IA</b> — seus dados organizados, decisão na mão<br />
            ⎇ <b>assistente com cérebro</b> — memória de verdade, que aprende com você
          </div>
        </section>

        {/* ── CLAUDINEI ── */}
        <section className="pc-sec">
          <p className="pc-label pc-r">quando você travar</p>
          <h2 className="pc-h2 pc-r">Suporte em segundos, não em dias.</h2>
          <div className="pc-duo">
            <div className="pc-r">
              <p className="pc-sec-sub" style={{ marginTop: 0 }}>
                O pior momento? 23h de uma terça. Travado num erro. Ninguém pra
                perguntar. Por isso todo membro tem o{' '}
                <strong style={{ color: 'var(--text)' }}>Claudinei</strong> no
                Telegram — o agente do Club que assistiu todas as aulas.
              </p>
              <div className="pc-feat">
                <div className="pc-feat-item"><i>+</i><span><b>Tira dúvida na hora</b> — e aponta o minuto exato da aula onde aquilo foi explicado.</span></div>
                <div className="pc-feat-item"><i>+</i><span><b>Destrava junto com você</b> — manda o print do erro e ele te fala o que é.</span></div>
                <div className="pc-feat-item"><i>+</i><span><b>Nunca dorme</b> — porque é às 23h que você trava de verdade.</span></div>
              </div>
            </div>
            <div className="pc-chat pc-r">
              <div className="pc-chat-head">claudinei · online</div>
              <div className="pc-chat-body">
                <div className="pc-msg me">
                  Claudinei, travei na aula do WhatsApp… meu robô não responde nada 😤
                  <span className="pc-msg-time">23:14</span>
                </div>
                <div className="pc-msg bot">
                  Clássico — 9 em 10 vezes é a conexão do WhatsApp que caiu. O Gobatto mostra como reconectar aos 42min da aula 7. Me manda um print da sua tela que eu já te falo se é isso.
                  <span className="pc-msg-time">23:14</span>
                </div>
                <div className="pc-msg me">
                  era isso kkkk voltou. valeu!
                  <span className="pc-msg-time">23:19</span>
                </div>
                <div className="pc-typing" aria-label="Claudinei digitando">
                  <i /><i /><i />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── COMUNIDADE / PROVA ── */}
        <section className="pc-sec">
          <p className="pc-label pc-r">a turma</p>
          <h2 className="pc-h2 pc-r">Ninguém monta isso sozinho.</h2>
          <div className="pc-duo" style={{ marginTop: 8 }}>
            <div>
              <p className="pc-sec-sub pc-r">
                O primeiro workshop teve 30 alunos.{' '}
                <strong style={{ color: 'var(--text)' }}>6 em cada 10 entraram pro
                Club no mesmo dia.</strong> Não porque eu pressionei. Porque viram
                funcionando ao vivo.
              </p>
              <p className="pc-sec-sub pc-r">
                É esse o grupo: gente montando de verdade. Mostrando o que travou,
                o que rodou, o que deu dinheiro. Num lugar assim é impossível ficar
                parado.
              </p>
            </div>
            <div className="pc-bigstat pc-r">
              60%
              <small>do primeiro workshop entrou no mesmo dia</small>
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section className="pc-sec" id="planos">
          <p className="pc-label pc-r">quanto custa</p>
          <h2 className="pc-h2 pc-r">Menos que o estrago de mais um ano parado.</h2>

          <div className="pc-anchor pc-r">
            <div className="pc-anchor-row"><span>implementação feita por mim</span><i /><span>R$15.000 + R$3.000/mês</span></div>
            <div className="pc-anchor-row"><span>mentoria individual</span><i /><span>R$10 a 15 mil/ano</span></div>
            <div className="pc-anchor-row"><span>cada workshop avulso</span><i /><span>R$200 a R$300</span></div>
            <div className="pc-anchor-row hot"><span>Push Club — tudo dentro, todo mês</span><i /><span>R$70/mês</span></div>
          </div>

          <div className="pc-future pc-r">
            <span className="pc-future-k">daqui a 90 dias</span>
            <p>
              O WhatsApp respondendo sozinho às 22h. Você no jantar, sem culpa.
              E o aviso de venda chegando no seu Telegram.
            </p>
          </div>

          <div className="pc-plans pc-r">
            <div className="pc-plan">
              <span className="pc-plan-name">mensal</span>
              <div className="pc-price">R$70<small>/mês</small></div>
              <ul>
                <li className="strong">Encontro ao vivo todo mês</li>
                <li className="strong">Todos os workshops gravados</li>
                <li className="strong">Claudinei 24/7 + grupo no Telegram</li>
                <li>Raio-X do seu negócio</li>
                <li>Biblioteca de fluxos e templates</li>
                <li>Sem fidelidade — fica um mês se quiser</li>
              </ul>
              <a href={STRIPE_MENSAL} className="pc-plan-cta ghost">assinar mensal</a>
            </div>
            <div className="pc-plan hero">
              <span className="pc-plan-badge">MAIS ESCOLHIDO · 2 MESES GRÁTIS</span>
              <span className="pc-plan-name">anual</span>
              <div className="pc-price">R$600<small>/ano</small></div>
              <span className="pc-plan-eq">= R$50/mês · economia de R$240</span>
              <ul>
                <li className="strong">Tudo do plano mensal</li>
                <li className="strong">2 meses grátis</li>
                <li>Seu preço trava — enquanto você ficar, não sobe</li>
                <li>Prioridade nas turmas ao vivo</li>
              </ul>
              <a href={STRIPE_ANUAL} className="pc-plan-cta solid">assinar anual →</a>
            </div>
          </div>

          <div className="pc-guarantee pc-r">
            <p>
              <b>Sobre o preço:</b> ia ser R$150/mês. A primeira turma entrou por
              R$50, de fundador. Hoje é R$70 — e a tabela só anda pra cima.{' '}
              <strong style={{ color: 'var(--text)' }}>Quem entra trava o preço
              enquanto ficar.</strong>
            </p>
            <p>
              <b>Garantia?</b> Não tem. É R$70. Não gostou? Cancela em 2 cliques.
              Sem multa, sem ligação de retenção. Sai e volta quando quiser.
            </p>
          </div>
          <p className="pc-plans-note">
            pagamento seguro via Stripe (aceita Apple Pay) · acesso imediato à área de membros
          </p>
        </section>

        {/* ── FAQ ── */}
        <section className="pc-sec">
          <p className="pc-label pc-r">dúvidas</p>
          <h2 className="pc-h2 pc-r">Perguntas frequentes</h2>
          <div className="pc-faq pc-r">
            <details>
              <summary>Preciso saber programar?</summary>
              <p className="pc-faq-a">
                Não. Eu não sou programador — montei tudo isso conversando com a
                IA. A maior parte da turma é dono de negócio, não dev.
              </p>
            </details>
            <details>
              <summary>O que exatamente eu recebo ao assinar?</summary>
              <p className="pc-faq-a">
                Tudo, no dia 1: aula ao vivo mensal, os 4 workshops gravados, o
                Claudinei 24/7, o grupo do Telegram, a biblioteca de fluxos e o
                raio-x do seu negócio. O que for lançado depois entra sem custo.
              </p>
            </details>
            <details>
              <summary>Sou iniciante total em IA. É pra mim?</summary>
              <p className="pc-faq-a">
                É — se você quer <em>colocar em prática</em>. O IA Fundamentos te
                dá a base e o Claudinei segura sua mão. Agora, se quer só
                acompanhar notícia de IA, esse não é o lugar.
              </p>
            </details>
            <details>
              <summary>Posso cancelar quando quiser?</summary>
              <p className="pc-faq-a">
                Sim. Sem fidelidade, sem multa. 2 cliques e pronto — o acesso fica
                até o fim do período pago.
              </p>
            </details>
            <details>
              <summary>Por que &ldquo;Push&rdquo;?</summary>
              <p className="pc-faq-a">
                Push é empurrão — o que separa quem assiste de quem faz. E quem é
                de tecnologia reconhece: <code style={{ fontFamily: 'var(--pc-mono)', fontSize: 13 }}>push</code>{' '}
                é o comando que publica seu trabalho no mundo. Lá dentro você usa
                os dois.
              </p>
            </details>
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section className="pc-final">
          <span className="pc-ghost" aria-hidden="true">PUSH</span>
          <p className="pc-final-cmd pc-r">
            daqui a 12 meses você vai ter <b>IAs rodando</b> — ou mais um ano de vídeo assistido
          </p>
          <h2 className="pc-final-h pc-r">
            Falta só<br /><em>o empurrão.</em><span className="pc-cursor pc-cursor-sm" />
          </h2>
          <a href="#planos" className="pc-btn pc-r">
            Entrar no Push Club →
          </a>
          <p className="pc-final-alt pc-r">
            Ainda não tá pronto? Começa pelo <a href="/members/login">IA
            Fundamentos</a> — curso grátis, na mesma plataforma.
          </p>
        </section>

        <footer className="pc-footer">
          <span>© {new Date().getFullYear()} IA Revolution · Augusto Gobatto</span>
          <a href="/privacidade">privacidade</a>
        </footer>
      </div>

      {/* reveal on scroll */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:0.12});document.querySelectorAll('.pc-r').forEach(function(el){io.observe(el)})})();`,
        }}
      />
    </div>
  )
}
