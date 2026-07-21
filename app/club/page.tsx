import { redirect } from 'next/navigation'

// A oferta oficial é a /club-v2 (R$70/mês). Esta página antiga anunciava
// R$50/R$500 com links Stripe desatualizados — redireciona pra não existir
// preço furado no ar. (Aposentada em 20/07/2026.)
export default function ClubPage() {
  redirect('/club-v2')
}
