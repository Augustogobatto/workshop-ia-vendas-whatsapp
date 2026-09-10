import Image from 'next/image'
import PreCheckoutCarga from './PreCheckoutCarga'
import type { PaginaVsl } from './telemetria'

/**
 * Dobras da /aula — tudo que só aparece DEPOIS do pitch.
 *
 * Renderizado no servidor e escondido por CSS (`#au-dobras`), não montado
 * por JS: se o script falhar, o conteúdo existe; quem revela é o player,
 * que põe `.au-aberta` no <html>.
 *
 * Copy: scratchpad/COPY-DOBRAS.md, tirada do roteiro v5 da VSL, com fonte
 * dobra a dobra. Decisões do Augusto em 08/09 que valem como regra aqui:
 *   - os DOIS planos na página (mensal R$70 e anual R$600)
 *   - garantia SÓ os 7 dias (nada de garantia de performance)
 *   - ZERO escassez: nenhum contador, vaga, data ou "vai subir"
 *   - sem preço no primeiro CTA (o de cima, dentro do herói)
 */

const STRIPE_MENSAL = 'https://buy.stripe.com/5kQ00k91qeVL2ve9JG9fW0f'
const STRIPE_ANUAL = 'https://buy.stripe.com/9B628s4La14Vb1KaNK9fW0g'

/**
 * Mensagem de membro só entra na página com consentimento POR ESCRITO da
 * pessoa. Mauricio (02/09), Poliana (08/07) e a conversa do Claudinei estão
 * escritas e prontas abaixo, mas ficam fora do ar até o Augusto confirmar.
 * Virar `true` sem o consentimento é publicar conversa de terceiro.
 */
const PROVAS_DE_MEMBROS = false

/**
 * `preCheckout` liga o popup do mensal (só a /aula-v2 passa true). O HTML das
 * dobras é EXATAMENTE o mesmo nos dois braços — inclusive os `<a>` de compra,
 * que continuam sendo links de verdade. O popup intercepta o clique de fora,
 * então quem estiver sem JS ainda chega no checkout.
 */
export default function Dobras({
  preCheckout = false,
  pagina = '/aula',
  videoId = 'club-trafego',
}: {
  preCheckout?: boolean
  pagina?: PaginaVsl
  videoId?: string
} = {}) {
  return (
    <>
    <div id="au-dobras">
      {/* ── prova ── */}
      <section className="au-sec">
        <div className="au-wrap">
          <span className="au-eyebrow">Prova</span>
          <h2 className="au-h2">O que está aqui tem data, nome e origem.</h2>
          <p>O que eu não consigo mostrar, eu não escrevo.</p>

          <div className="au-prova">
            <div className="au-recibo">
              <div className="quando">Junho de 2024</div>
              <p className="fala">&ldquo;Consegue me mandar seu ppt?&rdquo;</p>
              <div className="quem">
                Eu tinha acabado de apresentar no PLAT 10+, o evento da Hotmart, o que eu estava
                fazendo com IA atendendo WhatsApp em lançamento grande. No dia seguinte veio esse
                recado do JP, dono da Hotmart.
              </div>
              <Image
                src="/aula/jp-hotmart.png"
                alt="Mensagem do JP, da Hotmart, pedindo a apresentação depois do PLAT 10+"
                width={1592}
                height={1364}
              />
            </div>

            {PROVAS_DE_MEMBROS && (
              <>
                <div className="au-recibo">
                  <div className="quando">2 de setembro, no grupo do Club</div>
                  <p className="fala">
                    &ldquo;Montei o agente de venda e ficou muito bom, já fechamos a primeira venda
                    com ele.&rdquo;
                  </p>
                  <div className="quem">Mauricio, membro do Club.</div>
                </div>

                <div className="au-recibo">
                  <div className="quando">8 de julho, 12h17 e 16h50</div>
                  <p className="fala">
                    &ldquo;Tá dando super certo, ele tá amando.&rdquo; E, mais tarde no mesmo dia,
                    sobre a verificação da Meta: &ldquo;é uma roleta russa, só uma vez eu consegui
                    fazer tudo redondinho.&rdquo;
                  </p>
                  <div className="quem">
                    Poliana, agência. Todo mundo trava. Faz parte. O que eu quero que você veja é
                    que ela continuou.
                  </div>
                </div>

                <div className="au-recibo">
                  <div className="quando">11 de julho, entre 3h27 e 3h50 da manhã</div>
                  <p className="fala">Cinco respostas. No domingo seguinte, mais duas.</p>
                  <div className="quem">
                    Esse é o Claudinei, o agente que atende o meu WhatsApp. Ele é uma das quatro
                    peças, e está rodando enquanto você lê isso.
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── por que a maioria falha ── */}
      <section className="au-sec">
        <div className="au-wrap">
          <span className="au-eyebrow">Por que a maioria falha</span>
          <h2 className="au-h2">A IA é a mesma pra todo mundo. O lugar onde ela trabalha, não.</h2>
          <p>
            A maioria das pessoas usa IA como um Google educado. Vai lá, pergunta, ela responde bem,
            e a pessoa copia e cola no WhatsApp, no Canva, no Word.
          </p>
          <p>
            <strong>É uma consulta.</strong> Você marca, senta, conta a sua história, sai com uma
            receita. E quem executa a receita é você.
          </p>

          <div className="au-grade">
            <div className="au-card">
              <span className="num">1</span>
              <h3>As ferramentas</h3>
              <p>
                Um milhão de ferramentas de um lado pro outro, um monte de gente dizendo que isso
                aqui é bom, agora não é mais. A pessoa troca de ferramenta, troca de prompt, e
                continua no consultório.
              </p>
            </div>
            <div className="au-card">
              <span className="num">2</span>
              <h3>De novo</h3>
              <p>
                Toda vez que abre, conta o negócio de novo. Ou não conta, recebe uma resposta
                genérica, e conclui que a IA é genérica.
              </p>
            </div>
            <div className="au-card">
              <span className="num">3</span>
              <h3>Voltei pro chat</h3>
              <p>
                Já tentou montar uma IA de vendas que não funcionou. Já fez um curso que não deu
                certo. Travou, teve medo de fazer besteira, e voltou pro chat.
              </p>
            </div>
          </div>

          <p style={{ marginTop: 30 }}>
            Essas pessoas são inteligentes. <strong>O problema é que elas nunca contrataram a IA. Só
            consultaram.</strong>
          </p>
        </div>
      </section>

      {/* ── o mecanismo ── */}
      <section className="au-sec">
        <div className="au-wrap">
          <span className="au-eyebrow">O mecanismo</span>
          <h2 className="au-h2">Eu não consulto a minha IA. Eu contratei ela.</h2>
          <p>E pra um funcionário trabalhar, ele precisa de quatro coisas.</p>

          <div className="au-grade">
            <div className="au-card">
              <h3>Arquivo</h3>
              <p>
                A gaveta com os documentos da empresa e o processo padrão de como a gente faz as
                coisas. É o que faz ela pensar com a cabeça do seu negócio.
              </p>
            </div>
            <div className="au-card">
              <h3>Mesa</h3>
              <p>Um computador pra ela trabalhar, que não é o seu.</p>
            </div>
            <div className="au-card">
              <h3>Chaves</h3>
              <p>Pra ela entrar onde precisa sem pedir permissão toda vez.</p>
            </div>
            <div className="au-card">
              <h3>Rotinas</h3>
              <p>Coisa que ela faz todo dia sem ninguém mandar, inclusive de madrugada.</p>
            </div>
          </div>

          <p style={{ marginTop: 30 }}>
            É a mesma IA. No consultório ela é um funcionário trancado na recepção. Aqui ela tem a
            chave das portas.
          </p>
          <p>
            Começa pelo arquivo: no dia que ela acorda sabendo quem você é, você não quer mais
            voltar pro consultório.
          </p>
        </div>
      </section>

      {/* ── o que você recebe ── */}
      <section className="au-sec">
        <div className="au-wrap">
          <span className="au-eyebrow">O que você recebe</span>
          <h2 className="au-h2">Cada uma das quatro peças tem aula.</h2>
          <p>Tudo gravado, no seu ritmo, e o que eu lançar depois entra sem custo.</p>

          <div className="au-grade">
            <div className="au-card">
              <h3>Arquivo</h3>
              <p>
                A biblioteca de skills e prompts, os mesmos que eu uso no meu negócio. E o conector
                MCP, que pluga o Club dentro do seu Claude: ele passa a responder com as aulas.
              </p>
            </div>
            <div className="au-card">
              <h3>Mesa</h3>
              <p>
                Vibecode, dez aulas: o computador da IA montado do zero. Terminal, servidor, sem ser
                dev. E IA Fundamentos, quatorze aulas, pra você saber no que está mexendo.
              </p>
            </div>
            <div className="au-card">
              <h3>Chaves</h3>
              <p>
                Workshop de IA de Vendas no WhatsApp, vinte e três aulas. Prompt, fluxo pronto, e o
                que faz uma IA de vendas funcionar de verdade. Só isso eu cobro vinte mil pra
                implementar.
              </p>
            </div>
            <div className="au-card">
              <h3>Rotinas</h3>
              <p>
                Oficina de Claude Code: agentes que trabalham como funcionário, fazem tarefa real e
                mandam relatório sozinhos.
              </p>
            </div>
            <div className="au-card">
              <h3>Por fora das peças</h3>
              <p>
                Produção de conteúdo com IA: o método de reels e a máquina de carrossel que eu uso
                na minha marca. E o Comenta Eu Quero, o meu clone do ManyChat, de graça enquanto
                você for membro.
              </p>
            </div>
            <div className="au-card">
              <h3>Quando quebrar</h3>
              <p>
                Porque vai quebrar. Eu no grupo. O Claudinei vinte e quatro horas, apontando a aula
                que responde. E pelo menos um encontro ao vivo por mês, com tema votado pela turma.
              </p>
            </div>
          </div>

          <p style={{ marginTop: 30 }}>
            Algumas ferramentas que aparecem nas aulas são pagas. Em cada peça eu mostro o que roda
            de graça e o que vale pagar. Você não precisa assinar tudo.
          </p>
        </div>
      </section>

      {/* ── a oferta: os dois planos ── */}
      <section className="au-sec" id="planos">
        <div className="au-wrap">
          <span className="au-eyebrow">A oferta</span>
          <h2 className="au-h2">Você não vai pagar vinte mil.</h2>
          <p>
            Esse sistema eu costumo cobrar vinte mil reais pra implementar pra outra pessoa. E eu
            mesmo pago dez mil por mês num sistema que eu queria ter feito por dentro.
          </p>

          <div className="au-anchor">
            <div className="au-anchor-row"><span>esse sistema, implementado por mim</span><i /><span>R$20.000</span></div>
            <div className="au-anchor-row"><span>o sistema que eu alugo hoje</span><i /><span>R$10.000/mês</span></div>
            <div className="au-anchor-row hot"><span>Push Club</span><i /><span>R$600 por ano</span></div>
          </div>

          <div className="au-planos">
            <div className="au-plano hot">
              <span className="au-badge">dois meses de graça</span>
              <span className="name">anual</span>
              <div className="price">R$600<small>/ano</small></div>
              <span className="eq">Dá R$50 por mês. Você economiza R$240 em relação ao mensal.</span>
              <ul>
                <li>Tudo o que já está lá dentro, e o que eu lançar depois</li>
                <li>Uma cobrança só no ano, sem mensalidade voltando no cartão</li>
                <li>Encontro ao vivo todo mês</li>
                <li>Claudinei 24 horas e o grupo</li>
              </ul>
              <a target="_blank" rel="noopener" href={STRIPE_ANUAL} className="au-pill bloco" data-checkout="anual">
                Quero o anual: R$600
              </a>
            </div>

            <div className="au-plano">
              <span className="name">mensal</span>
              <div className="price">R$70<small>/mês</small></div>
              <span className="eq">Sem fidelidade. Fica um mês se quiser.</span>
              <ul>
                <li>Tudo o que já está lá dentro, e o que eu lançar depois</li>
                <li>Encontro ao vivo todo mês</li>
                <li>Claudinei 24 horas e o grupo</li>
              </ul>
              <a target="_blank" rel="noopener" href={STRIPE_MENSAL} className="au-pill ghost bloco" data-checkout="mensal">
                Quero entrar por R$70
              </a>
            </div>
          </div>

          <p style={{ marginTop: 26 }}>
            O preço que você entra é o que você paga, nos dois planos, enquanto você ficar.
          </p>
          <p>
            Se você cobrar dois mil reais por uma implementação dessas, uma só paga o ano e sobra.
          </p>
        </div>
      </section>

      {/* ── garantia: só os 7 dias ── */}
      <section className="au-sec">
        <div className="au-wrap">
          <span className="au-eyebrow">Garantia</span>
          <h2 className="au-h2">7 dias.</h2>
          <p>
            Você entra, olha tudo, manda o primeiro áudio pro Claudinei, e se não for pra você o
            dinheiro volta. Sete dias, sem formulário e sem pergunta.
          </p>
          <p>Depois disso, o mensal você cancela em dois cliques, sem multa.</p>
        </div>
      </section>

      {/* ── quem ensina ── */}
      <section className="au-sec">
        <div className="au-wrap">
          <span className="au-eyebrow">Quem ensina</span>
          <h2 className="au-h2">Augusto Gobatto</h2>
          <div className="au-quem">
            <Image src="/gobatto.jpg" alt="Augusto Gobatto" width={320} height={320} />
            <div>
              <p>
                Estou nesse mercado desde 2016. Comecei rodando tráfego, depois virei o cara que
                olha o dado e decide a próxima campanha. Mais de trezentos lançamentos analisados
                por dentro, antes da IA existir.
              </p>
              <p>
                Quando a IA chegou eu fui com tudo e mudei meus negócios com ela. Hoje uma escola em
                que eu estou por dentro atende e vende no WhatsApp com IA. Humano só entra no caso
                grande.
              </p>
              <p>
                <strong>Eu não sou programador. Sou o cara que bateu na parede e achou o jeito.</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── faq ── */}
      <section className="au-sec">
        <div className="au-wrap">
          <span className="au-eyebrow">Dúvidas</span>
          <h2 className="au-h2">O que me perguntam antes de entrar.</h2>

          <div className="au-faq">
            <details>
              <summary>Preciso saber programar?</summary>
              <div className="a">
                Não. Quem montou tudo isso não sabe programar. O que você precisa é montar as quatro
                peças na ordem, e cada uma delas tem aula.
              </div>
            </details>
            <details>
              <summary>Já tentei antes e travei. Vai ser diferente?</summary>
              <div className="a">
                Foi assim que quase todo mundo aqui chegou. Você vai travar de novo, isso não muda.
                O que muda é que agora, quando travar, você tem a quem perguntar: eu no grupo, o
                Claudinei 24 horas apontando a aula, e um encontro ao vivo por mês.
              </div>
            </details>
            <details>
              <summary>Quanto tempo por semana isso exige?</summary>
              <div className="a">
                Duas, três horas. Não tem prazo pra terminar: as aulas não expiram enquanto você for
                membro.
              </div>
            </details>
            <details>
              <summary>Preciso de servidor, VPS, essas coisas?</summary>
              <div className="a">
                Não pra começar. A primeira peça é o arquivo: uma página sobre a sua empresa e a
                primeira correção escrita. Não instala nada. No dia seguinte a sua IA acorda sabendo
                quem você é.
              </div>
            </details>
            <details>
              <summary>As ferramentas são pagas?</summary>
              <div className="a">
                Algumas. Em cada peça eu mostro o que roda de graça e o que vale pagar. Você não
                precisa assinar tudo.
              </div>
            </details>
            <details>
              <summary>Não dá pra aprender isso de graça no YouTube?</summary>
              <div className="a">
                Se desse, você já teria feito. O YouTube te dá tutorial de ferramenta. O que falta é
                a sequência: sem ela o esforço não acumula, e você recomeça toda vez.
              </div>
            </details>
            <details>
              <summary>Isso serve pro meu negócio, que não é de internet?</summary>
              <div className="a">
                As quatro peças são as mesmas em qualquer negócio: onde a IA trabalha, o que ela
                sabe da sua empresa, onde ela pode entrar e o que ela faz sozinha todo dia. O que
                muda é o que você bota nela. Leva o seu caso pro encontro ao vivo e a gente olha o
                seu.
              </div>
            </details>
            <details>
              <summary>Posso cancelar quando quiser?</summary>
              <div className="a">
                Pode. Dois cliques, sem multa. O acesso fica até o fim do período que você já pagou.
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* ── fecho ── */}
      <section className="au-sec au-fecho">
        <div className="au-wrap">
          <h2 className="au-h2">A IA é a mesma pra todo mundo. O lugar onde ela trabalha, não.</h2>
          <p>
            Entra, manda o primeiro áudio hoje, e essa semana a sua IA acorda sabendo quem você é.
          </p>
          <div className="au-botoes">
            <a target="_blank" rel="noopener" href={STRIPE_ANUAL} className="au-pill" data-checkout="anual">
              Quero o anual: R$600
            </a>
            <a target="_blank" rel="noopener" href={STRIPE_MENSAL} className="au-pill ghost" data-checkout="mensal">
              Quero o mensal: R$70
            </a>
          </div>
          <p className="au-nota" style={{ marginTop: 16 }}>
            Acesso imediato · 7 dias de garantia · cancelamento em dois cliques
          </p>
        </div>
      </section>


      {/* barra fixa mobile — SEM preço, como manda o guardrail do funil de origem */}
      <div className="au-fixo">
        <a href="#planos" className="au-pill bloco">
          Ver os planos
        </a>
      </div>
    </div>
    {/* fora de #au-dobras: o modal é `fixed` e não pode herdar o display:none
        da trava do pitch. Ele só abre no clique do mensal, que só existe
        depois do pitch — a guarda continua valendo. */}
    {preCheckout && <PreCheckoutCarga pagina={pagina} videoId={videoId} />}
    </>
  )
}

/**
 * O rodapé fica FORA da trava de propósito (guardrail do funil de origem):
 * disclaimer legal, CDC e links de privacidade não podem depender do minuto
 * do vídeo. Texto que protege juridicamente aparece sempre.
 */
export function Rodape() {
  return (
    <footer className="au-rodape">
      <div className="au-wrap">
        <p className="legal">
          Os resultados citados nesta página são da minha própria operação e de membros
          identificados, com nome e data, publicados com autorização deles. Não representam
          promessa de resultado. O que cada pessoa consegue depende do que ela monta e varia de
          caso para caso.
        </p>
        <div>
          O preço que você entra é o que você paga, nos dois planos, enquanto você ficar.
          <br />7 dias de arrependimento (art. 49, CDC) · cancelamento em dois cliques
          {/* razão social, CNPJ e endereço: o Decreto 7.962/2013 exige os três
              em página que vende pela internet. CNPJ conferido na base pública
              da Receita em 08/09/2026 (ATIVA desde 2020, sócios Augusto e
              Karina). No acervo havia dúvida sobre o endereço de Coroaci/MG —
              é o cadastro mesmo, confirmado pelo Augusto. */}
          <br />ÂMAGO LTDA · CNPJ 39.325.398/0001-71
          <br />Rua Dom Manoel, 25, Centro, Coroaci/MG, CEP 39710-000
          <br />© 2026 Augusto Gobatto · <a href="/privacidade">Política de privacidade</a>
        </div>
      </div>
    </footer>
  )
}
