'use client'

import dynamic from 'next/dynamic'
import type { PaginaVsl } from './telemetria'

/**
 * Carga preguiçosa do popup.
 *
 * `Dobras` é o mesmo componente nos dois braços, e um `import` estático do
 * `PreCheckout` colocaria o código dele também no bundle da /aula — o braço
 * de CONTROLE ficaria mais pesado por causa de uma tela que ele nunca mostra.
 * Diferença de peso entre os braços vira diferença de play rate, e aí o teste
 * mede infra em vez de mensagem. Esta casca de três linhas é o que fica na
 * /aula; o popup de verdade vira um chunk que só a /aula-v2 baixa.
 */
const PreCheckout = dynamic(() => import('./PreCheckout'), { ssr: false })

export default function PreCheckoutCarga(props: { pagina: PaginaVsl; videoId: string }) {
  return <PreCheckout {...props} />
}
