'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { carimbar, resolverSck, visitanteId } from '../../lib/rastreio'
import { contextoVsl, enviarEvento, type PaginaVsl } from './telemetria'
import {
  cpfFormatado,
  cpfValido,
  emailValido,
  telE164,
  telFormatado,
  telValido,
} from '../../lib/br'

/**
 * Pré-checkout do mensal — só existe na /aula-v2 (braço de teste).
 *
 * O clique no botão do mensal abre isto em vez de ir direto pro Stripe:
 *   1. WhatsApp  → salvo no servidor assim que fica válido, sem esperar avançar
 *   2. cartão ou Pix recorrente
 *   3. (só Pix) nome + CPF + e-mail → QR de Pix Automático
 *
 * Cinco coisas que NÃO podem se perder aqui:
 *
 *  1. **Fonte única do link do Stripe.** O caminho do cartão manda pro
 *     `href` do próprio `<a>` que foi clicado, já carimbado com
 *     `client_reference_id`. Remontar a URL a partir da constante mata o
 *     rastreio no clique que vende — foi o bug da Gizelly (07/08/2026),
 *     9,1% de rastreio no dia. Regra 5 da skill `rastreio-checkout`.
 *  2. **Máscara de telefone que não come o DDD.** Tirar o `55` só quando
 *     sobram mais de 11 dígitos (existe DDD 55, Santa Maria/RS), escutar
 *     `input`/`change`/`blur` porque autofill nem sempre dispara `input`, e
 *     reformatar 400 ms depois de abrir, quando o gerenciador de senhas cai.
 *  3. **Nada de escassez.** Nem aqui dentro. O relógio do QR é o prazo real
 *     do código do banco (1 h), não pressão de venda.
 *  4. **O botão nunca morre.** Todo erro do backend vira frase em português
 *     e devolve o botão; travar a pessoa numa tela sem saída é perder venda
 *     que já estava decidida.
 *  5. **Já é membro** para o fluxo antes do QR: o upsert de `purchases` do
 *     handler do Asaas reescreveria a linha de quem já paga pela Stripe.
 */

type Passo = 'telefone' | 'metodo' | 'dados' | 'qr' | 'membro'

type Qr = {
  authorization_id: string
  payload: string
  encodedImage?: string | null
  expira_em?: string | null
}

const VALOR_MENSAL = 'R$70'
const POLL_MS = 5000

function agoraSegundos() {
  return Math.floor(Date.now() / 1000)
}

function relogio(segundos: number) {
  const s = Math.max(0, segundos)
  const m = Math.floor(s / 60)
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

export default function PreCheckout({
  pagina,
  videoId,
}: {
  pagina: PaginaVsl
  videoId: string
}) {
  const [aberto, setAberto] = useState(false)
  const [passo, setPasso] = useState<Passo>('telefone')
  const [telefone, setTelefone] = useState('')
  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [email, setEmail] = useState('')
  const [erro, setErro] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [qr, setQr] = useState<Qr | null>(null)
  const [restam, setRestam] = useState<number | null>(null)
  const [copiou, setCopiou] = useState(false)

  const caixaRef = useRef<HTMLDivElement | null>(null)
  const telRef = useRef<HTMLInputElement | null>(null)
  const checkoutRef = useRef<string>('')
  const focoAnterior = useRef<HTMLElement | null>(null)
  const telefoneSalvo = useRef<string>('')
  const fechouPorConversao = useRef(false)

  /* ── telemetria ─────────────────────────────────────────────
     Mesma sessão e mesma variante do player: o popup só existe depois do
     pitch, então as chaves já foram gravadas no boot dele. */
  const evento = useCallback(
    (nome: string, rotulo?: string) => {
      const ctx = contextoVsl(videoId)
      enviarEvento({
        video_id: videoId,
        versao_id: ctx.versao_id,
        sessao: ctx.sessao,
        evento: nome,
        pagina,
        visitante_id: visitanteId(),
        rotulo,
        interno: ctx.interno,
        utm: (() => {
          try {
            return resolverSck() + ' ' + window.location.search
          } catch {
            return undefined
          }
        })(),
      })
    },
    [pagina, videoId]
  )

  const salvar = useCallback(
    async (campos: Record<string, unknown>): Promise<{ membro: boolean }> => {
      try {
        const r = await fetch('/api/pre-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            visitante_id: visitanteId(),
            pagina,
            versao_id: contextoVsl(videoId).versao_id ?? undefined,
            sck: resolverSck() || undefined,
            ...campos,
          }),
        })
        const d = (await r.json().catch(() => ({}))) as { membro?: boolean }
        return { membro: d.membro === true }
      } catch {
        return { membro: false }
      }
    },
    [pagina, videoId]
  )

  /* ── abre no clique do mensal ──────────────────────────────
     Fase de captura + preventDefault: o listener do AulaPlayer é de
     borbulha, então ele continua registrando `clicou_cta` e o
     InitiateCheckout do pixel. Os dois braços do teste medem a mesma coisa
     no mesmo ponto — a única diferença é que aqui a navegação não sai. */
  useEffect(() => {
    const onClique = (e: MouseEvent) => {
      const alvo = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>(
        'a[data-checkout="mensal"]'
      )
      if (!alvo) return
      /* carimba de novo agora: se algo reescreveu o href depois do mount, o
         id do visitante entra antes de a URL virar a fonte única daqui. */
      carimbar(alvo, visitanteId())
      checkoutRef.current = alvo.href
      e.preventDefault()

      focoAnterior.current = document.activeElement as HTMLElement | null
      fechouPorConversao.current = false
      setErro('')
      setAberto(true)
      setPasso('telefone')
      evento('pre_checkout_abriu')
      salvar({ estado: 'abriu' })
    }
    document.addEventListener('click', onClique, true)
    return () => document.removeEventListener('click', onClique, true)
  }, [evento, salvar])

  const fechar = useCallback(
    (motivo: string) => {
      if (!aberto) return
      setAberto(false)
      if (!fechouPorConversao.current) evento('pre_checkout_fechou', motivo)
      try {
        focoAnterior.current?.focus()
      } catch {}
    },
    [aberto, evento]
  )

  /* ── acessibilidade: Esc fecha, foco preso na caixa, corpo travado ── */
  useEffect(() => {
    if (!aberto) return
    const onTecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        fechar('esc')
        return
      }
      if (e.key !== 'Tab') return
      const caixa = caixaRef.current
      if (!caixa) return
      const focaveis = caixa.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (!focaveis.length) return
      const primeiro = focaveis[0]
      const ultimo = focaveis[focaveis.length - 1]
      if (e.shiftKey && document.activeElement === primeiro) {
        e.preventDefault()
        ultimo.focus()
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault()
        primeiro.focus()
      }
    }
    document.addEventListener('keydown', onTecla)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onTecla)
      document.body.style.overflow = overflow
    }
  }, [aberto, fechar])

  /* foco inicial + a reformatação de 400ms que pega o autofill do gerenciador
     de senhas, que costuma cair DEPOIS de o modal abrir */
  useEffect(() => {
    if (!aberto || passo !== 'telefone') return
    const t1 = window.setTimeout(() => telRef.current?.focus(), 60)
    const t2 = window.setTimeout(() => {
      const el = telRef.current
      if (el && el.value) setTelefone(telFormatado(el.value))
    }, 400)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [aberto, passo])

  /* ── passo 1: telefone ── */
  const aoMudarTelefone = (v: string) => {
    setTelefone(telFormatado(v))
    setErro('')
  }

  /**
   * O telefone válido é salvo NA HORA, sem esperar a pessoa avançar — é o que
   * alimenta a régua de recuperação de quem parou no meio (Fase 3).
   */
  const guardarTelefone = useCallback(
    async (avancar: boolean) => {
      if (!telValido(telefone)) {
        if (avancar) setErro('Faltou o DDD ou um dígito. Confere o número.')
        return
      }
      const e164 = telE164(telefone)
      const novo = e164 !== telefoneSalvo.current
      telefoneSalvo.current = e164
      if (novo) evento('pre_checkout_telefone')
      const { membro } = await salvar({ telefone: e164, estado: 'telefone' })
      if (membro) {
        fechouPorConversao.current = true
        evento('ja_membro', 'telefone')
        setPasso('membro')
        return
      }
      if (avancar) setPasso('metodo')
    },
    [telefone, evento, salvar]
  )

  /* ── passo 2: método ── */
  const escolherCartao = async () => {
    fechouPorConversao.current = true
    evento('pre_checkout_metodo', 'cartao')
    /* não espera o salvar: o clique é um gesto do usuário e a navegação tem
       que sair enquanto ele ainda vale. keepalive garante que o POST vai. */
    fetch('/api/pre-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        visitante_id: visitanteId(),
        pagina,
        versao_id: contextoVsl(videoId).versao_id ?? undefined,
        sck: resolverSck() || undefined,
        metodo: 'cartao',
        estado: 'stripe_redirect',
      }),
    }).catch(() => {})
    /* FONTE ÚNICA: o href do <a> clicado, já carimbado. Nunca remontar. */
    const url = checkoutRef.current
    if (url) window.location.assign(url)
  }

  const escolherPix = async () => {
    evento('pre_checkout_metodo', 'pix')
    setErro('')
    setPasso('dados')
    salvar({ metodo: 'pix', estado: 'metodo' })
  }

  /* ── passo 3: nome, CPF, e-mail → QR ── */
  const gerarQr = useCallback(async () => {
    if (ocupado) return
    if (!nome.trim().includes(' ')) {
      setErro('Escreve o nome completo, como está no seu CPF.')
      return
    }
    if (!cpfValido(cpf)) {
      setErro('CPF inválido: confere os números.')
      return
    }
    if (!emailValido(email)) {
      setErro('E-mail inválido: confere o endereço.')
      return
    }
    setOcupado(true)
    setErro('')
    try {
      evento('pre_checkout_dados')
      await salvar({
        nome: nome.trim(),
        cpf: cpf.replace(/\D/g, ''),
        email: email.trim().toLowerCase(),
        metodo: 'pix',
        estado: 'dados',
      })
      const r = await fetch('/api/pre-checkout/pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitante_id: visitanteId(),
          telefone: telE164(telefone),
          nome: nome.trim(),
          cpf: cpf.replace(/\D/g, ''),
          email: email.trim().toLowerCase(),
          sck: resolverSck() || undefined,
          versao_id: contextoVsl(videoId).versao_id ?? undefined,
          pagina,
        }),
      })
      const d = (await r.json().catch(() => ({}))) as Record<string, unknown>
      if (d.membro === true) {
        fechouPorConversao.current = true
        evento('ja_membro', 'dados')
        setPasso('membro')
        return
      }
      if (!r.ok || !d.payload || !d.authorization_id) {
        setErro(
          (typeof d.erro === 'string' && d.erro) ||
            'Não consegui gerar o código agora. Tenta de novo ou escolhe cartão.'
        )
        return
      }
      setQr({
        authorization_id: String(d.authorization_id),
        payload: String(d.payload),
        encodedImage: typeof d.encodedImage === 'string' ? d.encodedImage : null,
        expira_em: typeof d.expira_em === 'string' ? d.expira_em : null,
      })
      setCopiou(false)
      setPasso('qr')
      evento('pix_qr_exibido')
      salvar({ estado: 'qr_exibido' })
    } catch {
      setErro('A conexão falhou. Tenta de novo ou escolhe cartão.')
    } finally {
      setOcupado(false)
    }
  }, [ocupado, nome, cpf, email, telefone, pagina, videoId, salvar, evento])

  /* ── tela do QR: relógio + polling ── */
  useEffect(() => {
    if (passo !== 'qr' || !qr) return
    const fim = qr.expira_em ? Math.floor(new Date(qr.expira_em).getTime() / 1000) : null
    const tique = () => setRestam(fim ? fim - agoraSegundos() : null)
    tique()
    const id = window.setInterval(tique, 1000)
    return () => window.clearInterval(id)
  }, [passo, qr])

  useEffect(() => {
    if (passo !== 'qr' || !qr) return
    let vivo = true
    let id = 0
    const olhar = async () => {
      try {
        const r = await fetch(
          `https://app.comentaeuquero.com/club-pagamentos/pix/status?id=${encodeURIComponent(qr.authorization_id)}`,
          { cache: 'no-store' }
        )
        const d = (await r.json().catch(() => ({}))) as { estado?: string }
        if (!vivo) return
        if (d.estado === 'pago' || d.estado === 'ativo') {
          fechouPorConversao.current = true
          evento('pix_pago')
          window.location.assign(
            '/aula/obrigado?asaas=' + encodeURIComponent(qr.authorization_id)
          )
          return
        }
        if (d.estado === 'expirado' || d.estado === 'recusado') {
          setRestam(0)
          return
        }
      } catch {
        /* rede oscilou: a próxima volta tenta de novo, sem mostrar erro —
           o código do banco continua válido do mesmo jeito */
      }
      if (vivo) id = window.setTimeout(olhar, POLL_MS)
    }
    id = window.setTimeout(olhar, POLL_MS)
    return () => {
      vivo = false
      window.clearTimeout(id)
    }
  }, [passo, qr, evento])

  const copiar = async () => {
    if (!qr) return
    let ok = false
    try {
      await navigator.clipboard.writeText(qr.payload)
      ok = true
    } catch {
      /* Safari antigo e WebView sem permissão: cai no truque do <textarea> */
      try {
        const t = document.createElement('textarea')
        t.value = qr.payload
        t.setAttribute('readonly', '')
        t.style.position = 'fixed'
        t.style.opacity = '0'
        document.body.appendChild(t)
        t.select()
        ok = document.execCommand('copy')
        document.body.removeChild(t)
      } catch {}
    }
    if (ok) {
      setCopiou(true)
      window.setTimeout(() => setCopiou(false), 2600)
    } else {
      setErro('Não consegui copiar. Segura o dedo no código pra selecionar.')
    }
  }

  const novoCodigo = () => {
    setQr(null)
    setRestam(null)
    setErro('')
    setPasso('dados')
  }

  if (!aberto) return null

  const expirado = restam !== null && restam <= 0

  return (
    <div
      className="pc-fundo"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) fechar('fundo')
      }}
    >
      <div
        className="pc-caixa"
        ref={caixaRef}
        role="dialog"
        aria-modal="true"
        aria-label="Entrar no Push Club pelo mensal"
      >
        <button type="button" className="pc-x" onClick={() => fechar('x')} aria-label="Fechar">
          ×
        </button>

        {passo === 'telefone' && (
          <>
            <h2 className="pc-h">Qual é o seu WhatsApp?</h2>
            <label className="pc-campo">
              <span>WhatsApp</span>
              <input
                ref={telRef}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                name="whatsapp"
                placeholder="(54) 98119-0099"
                value={telefone}
                onChange={(e) => aoMudarTelefone(e.target.value)}
                onBlur={(e) => {
                  aoMudarTelefone(e.target.value)
                  guardarTelefone(false)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    guardarTelefone(true)
                  }
                }}
              />
            </label>
            <p className="pc-ajuda">É por aqui que a gente te manda o acesso.</p>
            {erro && <p className="pc-erro">{erro}</p>}
            <button type="button" className="au-pill bloco" onClick={() => guardarTelefone(true)}>
              Continuar
            </button>
          </>
        )}

        {passo === 'metodo' && (
          <>
            <h2 className="pc-h">Como você prefere pagar?</h2>
            <div className="pc-opcoes">
              <button type="button" className="pc-opcao" onClick={escolherCartao}>
                <strong>Cartão de crédito (recorrente)</strong>
                <span>Você paga no checkout da Stripe.</span>
              </button>
              <button type="button" className="pc-opcao" onClick={escolherPix}>
                <strong>Pix recorrente (autoriza uma vez no app do banco)</strong>
                <span>Sem cartão. A cobrança mensal sai direto da sua conta.</span>
              </button>
            </div>
            {erro && <p className="pc-erro">{erro}</p>}
            <button type="button" className="pc-voltar" onClick={() => setPasso('telefone')}>
              ← voltar
            </button>
          </>
        )}

        {passo === 'dados' && (
          <>
            <h2 className="pc-h">Só falta isso pro Pix.</h2>
            <p className="pc-ajuda">O banco pede nome e CPF pra autorizar a recorrência.</p>
            <label className="pc-campo">
              <span>Nome completo</span>
              <input
                type="text"
                autoComplete="name"
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value)
                  setErro('')
                }}
              />
            </label>
            <label className="pc-campo">
              <span>CPF</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => {
                  setCpf(cpfFormatado(e.target.value))
                  setErro('')
                }}
                onBlur={(e) => setCpf(cpfFormatado(e.target.value))}
              />
            </label>
            <label className="pc-campo">
              <span>E-mail</span>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="voce@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setErro('')
                }}
              />
            </label>
            <p className="pc-ajuda">O login do Club é por e-mail.</p>
            {erro && <p className="pc-erro">{erro}</p>}
            <button
              type="button"
              className="au-pill bloco"
              onClick={gerarQr}
              disabled={ocupado}
              aria-busy={ocupado}
            >
              {ocupado ? 'Gerando…' : 'Gerar o código Pix'}
            </button>
            <button type="button" className="pc-voltar" onClick={() => setPasso('metodo')}>
              ← voltar
            </button>
          </>
        )}

        {passo === 'qr' && qr && (
          <>
            <h2 className="pc-h">Abra o app do seu banco.</h2>
            <p className="pc-ajuda">
              Ele vai perguntar duas coisas: pagar {VALOR_MENSAL} agora e autorizar {VALOR_MENSAL}{' '}
              por mês.
            </p>

            {!expirado ? (
              <>
                <button type="button" className="au-pill bloco" onClick={copiar}>
                  {copiou ? 'Código copiado' : 'Copiar código Pix'}
                </button>
                <p className="pc-ajuda pc-centro">Cola no Pix Copia e Cola do seu banco.</p>

                {qr.encodedImage && (
                  <details className="pc-qr">
                    <summary>Ou aponte a câmera para o QR</summary>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`data:image/png;base64,${qr.encodedImage}`}
                      alt="QR Code do Pix do Push Club mensal"
                      width={220}
                      height={220}
                    />
                  </details>
                )}

                <p className="pc-status">
                  <span className="pc-ponto" aria-hidden />
                  Esperando o pagamento. Pode deixar essa tela aberta.
                </p>
                {restam !== null && (
                  <p className="pc-ajuda pc-centro">Esse código vale por {relogio(restam)}.</p>
                )}
              </>
            ) : (
              <>
                <p className="pc-erro">O código expirou sem ser pago.</p>
                <button type="button" className="au-pill bloco" onClick={novoCodigo}>
                  Gerar outro código
                </button>
              </>
            )}
            {erro && <p className="pc-erro">{erro}</p>}
          </>
        )}

        {passo === 'membro' && (
          <>
            <h2 className="pc-h">Você já é membro do Club.</h2>
            <p className="pc-ajuda">
              Achei uma assinatura ativa no seu nome. Não precisa pagar de novo.
            </p>
            <a href="/members/login" className="au-pill bloco">
              Entrar
            </a>
          </>
        )}
      </div>
    </div>
  )
}
