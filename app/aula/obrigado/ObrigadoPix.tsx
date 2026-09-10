/**
 * Ramo do Pix Automático da /aula/obrigado (`?asaas=<authorization_id>`).
 *
 * **Este ramo NÃO dispara Purchase no pixel — de propósito.**
 *
 * O Purchase do Asaas já sai server-side, do `club-pagamentos` na vps-claude,
 * com `event_id = payment.id` (o id da cobrança no Asaas). A deduplicação da
 * Meta exige que os dois lados mandem o MESMO `eventID`, e esta página não
 * tem o id do pagamento: o que ela recebe é o id da AUTORIZAÇÃO, que é outro
 * objeto. Disparar aqui com qualquer outro id contaria a mesma venda duas
 * vezes e estragaria o CAC do painel. Se um dia o backend passar a devolver
 * o `payment.id` no `GET /pix/status`, aí sim dá pra espelhar o evento.
 *
 * Não é client component: não há nada pra rodar no navegador.
 */
export default function ObrigadoPix() {
  return (
    <section className="au-hero">
      <span className="au-eyebrow">Push Club</span>
      <h1 className="au-h2" style={{ margin: 0 }}>
        Pix confirmado.
      </h1>
      <p className="au-sub">
        Club mensal, R$70 por mês.
        <br />O acesso chega no seu e-mail e no seu WhatsApp.
      </p>
      <a href="/members/login" className="au-pill">
        Entrar na plataforma
      </a>
      <p className="au-nota">
        A próxima cobrança sai daqui a 30 dias, direto na sua conta. Pra cancelar, é no app do seu
        banco, em Pix Automático.
      </p>
      <p className="au-nota">
        Não chegou?{' '}
        <a href="mailto:oi@augustogobatto.com" style={{ color: 'inherit' }}>
          oi@augustogobatto.com
        </a>
      </p>
    </section>
  )
}
