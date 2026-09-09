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

/** Evento padrão da Meta (ViewContent, InitiateCheckout...) — é o que campanha otimiza. */
export function pixelTrack(nome: string, params?: FbqParams) {
  fbq('track', nome, params)
}

/** Evento custom (Pitch, AbriuOferta...) — serve pra público e pra ler funil no Gerenciador. */
export function pixelCustom(nome: string, params?: FbqParams) {
  fbq('trackCustom', nome, params)
}

/** Valor do plano pro InitiateCheckout. Chave = `data-checkout` dos CTAs em Dobras.tsx. */
export const VALOR_PLANO: Record<string, number> = { mensal: 70, anual: 600 }
