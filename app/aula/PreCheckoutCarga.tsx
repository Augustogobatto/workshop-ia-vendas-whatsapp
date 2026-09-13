'use client'

import dynamic from 'next/dynamic'
import type { PaginaVsl } from './telemetria'

/**
 * Carga preguiçosa do popup.
 *
 * O popup é uma tela que a maioria das visitas nunca vê: 38% das sessões pagas
 * saem nos primeiros 15 s de vídeo, e só 5% chegam a clicar em comprar. Um
 * `import` estático poria esse código no bundle inicial da página inteira e
 * roubaria banda de quem ainda está decidindo se dá play. Carregamento
 * preguiçoso mantém o popup fora do caminho crítico do vídeo.
 */
const PreCheckout = dynamic(() => import('./PreCheckout'), { ssr: false })

export default function PreCheckoutCarga(props: { pagina: PaginaVsl; videoId: string }) {
  return <PreCheckout {...props} />
}
