'use client'

import { useEffect } from 'react'
import { pixelPronto, pixelTrack } from '../pixel'
import { CAPI_BASE } from '../../../lib/capi'

/**
 * Purchase no pixel, deduplicado com a CAPI.
 *
 * O Stripe volta com `?session_id=cs_...`. Esse id é o `eventID` do Purchase
 * — o servidor (webhook na VPS) manda o mesmo evento pela CAPI com o mesmo
 * id, e a Meta conta um só. Nunca trocar o eventID por outro valor.
 *
 * Valor/plano vêm de `GET ${CAPI_BASE}/stripe-capi/sessao?id=`. Se falhar
 * (serviço fora, placeholder, timeout), dispara sem `value` mas com o mesmo
 * eventID: perder o valor é aceitável, perder a deduplicação não.
 *
 * Recarregar a página não dispara de novo: `sessionStorage` guarda o id.
 */
const SESSION_RE = /^cs_(live|test)_[A-Za-z0-9]+$/
const TIMEOUT_MS = 4000
const ESPERA_PIXEL_MS = 8000

type Sessao = { ok?: boolean; plano?: string; valor?: number | string; moeda?: string }

function chaveDisparo(sid: string) {
  return 'club_purchase_' + sid
}

function jaDisparou(sid: string) {
  try {
    return !!sessionStorage.getItem(chaveDisparo(sid))
  } catch {
    return false
  }
}

function marcarDisparo(sid: string) {
  try {
    sessionStorage.setItem(chaveDisparo(sid), String(Date.now()))
  } catch {}
}

/** Espera o stub do fbq existir (o PixelGate entra depois da hidratação). */
function quandoPixel(cb: () => void) {
  const inicio = Date.now()
  const tenta = () => {
    if (pixelPronto()) return cb()
    if (Date.now() - inicio > ESPERA_PIXEL_MS) return
    window.setTimeout(tenta, 100)
  }
  tenta()
}

async function lerSessao(sid: string): Promise<Sessao | null> {
  const ctrl = new AbortController()
  const timer = window.setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    const r = await fetch(`${CAPI_BASE}/stripe-capi/sessao?id=${encodeURIComponent(sid)}`, {
      signal: ctrl.signal,
    })
    if (!r.ok) return null
    const d = (await r.json()) as Sessao
    return d && d.ok !== false ? d : null
  } catch {
    return null
  } finally {
    window.clearTimeout(timer)
  }
}

export default function Obrigado() {
  useEffect(() => {
    let sid = ''
    try {
      sid = (new URLSearchParams(location.search).get('session_id') || '').trim()
    } catch {}
    if (!sid || !SESSION_RE.test(sid) || jaDisparou(sid)) return

    const disparar = (params: Record<string, string | number | undefined>) => {
      quandoPixel(() => {
        /* checa de novo na hora: em dev o React monta o efeito duas vezes */
        if (jaDisparou(sid)) return
        pixelTrack('Purchase', params, { eventID: sid })
        marcarDisparo(sid)
      })
    }

    lerSessao(sid).then((s) => {
      if (!s) {
        disparar({ currency: 'BRL', content_name: 'club' })
        return
      }
      /* `valor` é tratado como reais (não centavos): é o contrato combinado
         com o serviço da VPS. Se vier em centavos, corrigir LÁ, não aqui. */
      const valor = Number(s.valor)
      disparar({
        value: Number.isFinite(valor) && valor > 0 ? valor : undefined,
        currency: s.moeda ? String(s.moeda).toUpperCase() : 'BRL',
        content_name: 'club',
        content_category: s.plano ? String(s.plano) : undefined,
      })
    })
  }, [])

  return (
    <section className="au-hero">
      <span className="au-eyebrow">Push Club</span>
      <h1 className="au-h2" style={{ margin: 0 }}>
        Pronto.
      </h1>
      <p className="au-sub">
        Tua IA de casa começa agora.
        <br />O acesso chega no teu e-mail em alguns minutos.
      </p>
      <a href="/members/login" className="au-pill">
        Entrar na plataforma
      </a>
      <p className="au-nota">
        Não chegou? me chama:{' '}
        <a href="mailto:oi@augustogobatto.com" style={{ color: 'inherit' }}>
          oi@augustogobatto.com
        </a>
      </p>
    </section>
  )
}
