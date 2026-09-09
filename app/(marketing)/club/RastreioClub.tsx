'use client'

import { useEffect } from 'react'
import { carimbar, iniciarRastreio } from '../../../lib/rastreio'

/**
 * Rastreio da /club — o MESMO contrato da /aula, via `lib/rastreio.ts`:
 * sck → localStorage (`club_primeiro_toque`, formato inalterado),
 * `visitante_id` → `client_reference_id` nas âncoras do Stripe,
 * atribuição → POST /api/rastreio.
 *
 * Substitui o script inline que carimbava o `sck` (com `|`) no link — o
 * Payment Link do Stripe descartava o valor em silêncio.
 *
 * Roda no `useEffect`, ou seja, depois da hidratação. Pra cobrir um clique
 * que aconteça antes disso, o carimbo é reforçado no próprio clique, em
 * fase de captura, antes de a navegação sair.
 */
export default function RastreioClub() {
  useEffect(() => {
    const r = iniciarRastreio('/club')
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
