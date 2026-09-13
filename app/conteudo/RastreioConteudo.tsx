'use client'

import { useEffect } from 'react'
import { carimbar, iniciarRastreio } from '../../lib/rastreio'

/**
 * Rastreio da /conteudo — o MESMO contrato da /club e da /aula
 * (lib/rastreio.ts): sck → localStorage, visitante_id → client_reference_id
 * nas âncoras do Stripe, atribuição → POST /api/rastreio.
 * Reforço no clique em fase de captura cobre clique antes da hidratação.
 */
export default function RastreioConteudo() {
  useEffect(() => {
    const r = iniciarRastreio('/conteudo')
    const onClique = (e: MouseEvent) => {
      const alvo = (e.target as HTMLElement | null)?.closest?.('a[href*="buy.stripe.com"]')
      if (alvo) carimbar(alvo as HTMLAnchorElement, r.visitante)
    }
    document.addEventListener('click', onClique, true)
    return () => {
      document.removeEventListener('click', onClique, true)
      r.parar()
    }
  }, [])
  return null
}
