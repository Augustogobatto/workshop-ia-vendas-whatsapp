/**
 * Espelho da telemetria da /aula no Pixel da Meta.
 *
 * A BASE do pixel (fbevents.js + `fbq('init', 2685766708197733)` + PageView)
 * já é carregada em TODAS as rotas por `components/PixelGate.tsx`, montado no
 * `app/layout.tsx`. Este arquivo NÃO carrega base nenhuma — carregar de novo
 * aqui dobraria o PageView. Ele só dispara os eventos de funil ao lado do
 * envio pro `/api/vsl/evento`.
 *
 * Guarda: `window.fbq` pode não existir (adblock que barra o script antes do
 * stub, rota em `SEM_PIXEL`, SSR). Nesse caso a chamada é silenciosa — métrica
 * nunca derruba página de venda, e nada vai pro console.
 */

type FbqParams = Record<string, string | number | boolean | string[] | undefined>

/** 4º argumento do `fbq('track', ...)`: `eventID` é a chave de deduplicação com a CAPI. */
type FbqOpcoes = { eventID?: string }

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

function fbq(...args: unknown[]) {
  try {
    if (typeof window === 'undefined' || typeof window.fbq !== 'function') return
    window.fbq(...args)
  } catch {}
}

/** O pixel já está no ar? (o stub entra depois da hidratação, via `afterInteractive`) */
export function pixelPronto() {
  return typeof window !== 'undefined' && typeof window.fbq === 'function'
}

/**
 * Evento padrão da Meta (ViewContent, InitiateCheckout, Purchase...) — é o que
 * campanha otimiza. `opcoes.eventID` vai no 4º argumento do fbq; quando o
 * mesmo evento também sai pela CAPI, os dois precisam levar o MESMO id.
 */
export function pixelTrack(nome: string, params?: FbqParams, opcoes?: FbqOpcoes) {
  if (opcoes?.eventID) fbq('track', nome, params ?? {}, { eventID: opcoes.eventID })
  else fbq('track', nome, params)
}

/** Evento custom (Pitch, AbriuOferta...) — serve pra público e pra ler funil no Gerenciador. */
export function pixelCustom(nome: string, params?: FbqParams) {
  fbq('trackCustom', nome, params)
}

/** Valor do plano pro InitiateCheckout. Chave = `data-checkout` dos CTAs em Dobras.tsx. */
export const VALOR_PLANO: Record<string, number> = { mensal: 70, anual: 600 }
