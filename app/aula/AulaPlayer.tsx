'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Motor da /aula — portado do player do funil "Protocolo Viral"
 * (spec completa: scratchpad/SPEC-PLAYER.md, 55 guardrails e 45 bugs datados).
 *
 * Invariantes que NÃO podem se perder na porta:
 *  1. Duas travas independentes: a página (`.au-aberta`) e o botão sobre o
 *     vídeo (`ctaNoVideo`). Fundir as duas põe botão de compra no segundo zero.
 *  2. O pitch vem da VARIANTE que está tocando, nunca de constante fixa.
 *  3. MUDO NÃO É ASSISTIR: o gate exige `!muted`, senão aba aberta no mudo
 *     abre a oferta sem a pessoa ter ouvido um segundo.
 *  4. Nunca abrir por relógio de parede. Só falha real: `video.error` + 60s
 *     sem andar. Inação não abre — quem não ouve o preço não vê botão.
 *  5. O toque nunca se perde: se a fonte ainda não anexou, guarda a intenção
 *     e retoma quando anexar (senão o player fica morto e mudo até recarregar).
 *  6. Nada que apareça no pitch pode empurrar o vídeo (o herói mantém altura
 *     e o botão novo é absolute sobre o player).
 *  7. Sorteio sticky por localStorage, nunca por hash do visitante.
 *  8. `sync` vale só para a MESMA versão: trocou o corte, zera a posição.
 */

type Variante = {
  versao_id: number
  versao: number
  rotulo?: string
  mp4: string
  hls: string
  poster: string | null
  pitch_s: number
  duration_s: number
  peso?: number
  fase?: string
}

type Fixos = {
  headline?: { h1?: string; sub?: string; sem_headline?: boolean }
  overlay?: { eyebrow?: string; sub?: string; estilo?: string }
  thumb?: { thumb_id?: number | null; arquivo_url?: string | null }
  tarja?: { texto?: string | null; cor?: string; icone?: string; pulsa?: boolean } | null
}

type Config = {
  video_id: string
  publicada: boolean
  variantes: Variante[]
  fixos?: Fixos
  whatsapp?: { numero?: string; rotulo?: string; mensagem?: string }
}

type Sync = { versao_id: number | null; t: number; pitch_visto: boolean }

/* Rede: se o config estiver quebrado, a VSL não pode deixar de tocar. */
const PITCH_REDE = 900

function lerLS(chave: string) {
  try {
    return localStorage.getItem(chave)
  } catch {
    return null
  }
}
function gravarLS(chave: string, valor: string) {
  try {
    localStorage.setItem(chave, valor)
  } catch {}
}

/** Sorteio ponderado e STICKY. Peso ausente = 100; peso 0 desliga o braço. */
function sortear(variantes: Variante[], chave: string): Variante {
  const vivas = variantes.filter((v) => (typeof v.peso === 'number' ? v.peso : 100) > 0)
  const pool = vivas.length ? vivas : variantes
  const salvo = lerLS(chave)
  if (salvo) {
    const achada = pool.find((v) => String(v.versao_id) === salvo)
    if (achada) return achada
  }
  const total = pool.reduce((s, v) => s + (typeof v.peso === 'number' ? v.peso : 100), 0)
  let r = Math.random() * total
  let escolhida = pool[0]
  for (const v of pool) {
    r -= typeof v.peso === 'number' ? v.peso : 100
    if (r <= 0) {
      escolhida = v
      break
    }
  }
  gravarLS(chave, String(escolhida.versao_id))
  return escolhida
}

export default function AulaPlayer({ config }: { config: Config }) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const thumbRef = useRef<HTMLVideoElement | null>(null)
  const barraRef = useRef<HTMLElement | null>(null)
  const rafRef = useRef<number | null>(null)

  const [variante, setVariante] = useState<Variante | null>(null)
  const [cartao, setCartao] = useState<'som' | 'retomada' | 'pausa' | null>('som')
  const [carregando, setCarregando] = useState(false)
  const [semAutoplay, setSemAutoplay] = useState(false)
  const [anel, setAnel] = useState(false)
  const [ctaNoVideo, setCtaNoVideo] = useState(false)
  const [velocidade, setVelocidade] = useState(1)
  const [mostraControles, setMostraControles] = useState(false)

  /* refs de lógica: o player é imperativo, o React só desenha o estado */
  const fonteAnexada = useRef(false)
  const querComSom = useRef(false)
  const comecou = useRef(false)
  const pausadoPeloUsuario = useRef(false)
  const ultimoAndar = useRef(Date.now())
  const abertaRef = useRef(false)
  const syncRef = useRef<Sync | null>(null)
  const varianteRef = useRef<Variante | null>(null)
  const sessao = useRef<string>('')

  const chaveAB = `vsl_ab_${config.video_id}`
  const chaveSync = `vsl_sync_${config.video_id}`

  /* ── telemetria ─────────────────────────────────────────────
     sendBeacon: não bloqueia, não espera resposta, e se falhar a
     página segue tocando. Métrica nunca derruba página de venda. */
  const evento = useCallback(
    (nome: string, extra?: { segundo?: number; rotulo?: string }) => {
      try {
        const v = varianteRef.current
        const corpo = JSON.stringify({
          video_id: config.video_id,
          versao_id: v ? v.versao_id : null,
          sessao: sessao.current,
          evento: nome,
          segundo: extra?.segundo,
          rotulo: extra?.rotulo,
          utm: typeof window !== 'undefined' ? window.location.search.slice(0, 500) : '',
        })
        const blob = new Blob([corpo], { type: 'application/json' })
        if (!navigator.sendBeacon('/api/vsl/evento', blob)) {
          fetch('/api/vsl/evento', { method: 'POST', body: corpo, keepalive: true }).catch(() => {})
        }
      } catch {}
    },
    [config.video_id]
  )

  /**
   * Barra de progresso com a curva do funil de origem: na primeira metade
   * ela corre MUITO na frente do relógio (raiz quarta), passando a impressão
   * de vídeo curto — com 10% do tempo já mostra 28%. Da metade em diante é
   * linear, então o final anda no ritmo verdadeiro e a barra não "trava"
   * perto do fim, que é o que denunciaria o truque.
   *
   * Escrita direta no DOM via rAF: 60 setState por segundo re-renderizariam
   * o player inteiro à toa.
   */
  const pintarBarra = useCallback(() => {
    const video = videoRef.current
    const barra = barraRef.current
    if (!video || !barra) return
    const d = video.duration
    if (d > 0) {
      const s = video.currentTime
      const meio = d / 2
      const eased =
        s <= meio
          ? 0.5 * Math.pow(s / meio, 0.25)
          : 0.5 + 0.5 * ((s - meio) / (d - meio))
      barra.style.width = (Math.min(1, Math.max(0, eased)) * 100).toFixed(2) + '%'
    }
    if (!video.ended) {
      rafRef.current = requestAnimationFrame(pintarBarra)
    } else {
      barra.style.width = '100%'
    }
  }, [])

  const salvarSync = useCallback(
    (p: Partial<Sync>) => {
      const atual = syncRef.current || { versao_id: null, t: 0, pitch_visto: false }
      const novo = { ...atual, ...p }
      syncRef.current = novo
      gravarLS(chaveSync, JSON.stringify(novo))
    },
    [chaveSync]
  )

  /** Abre a página. Idempotente: chamada duas vezes não faz nada na segunda. */
  const abrir = useCallback(
    (motivo: string) => {
      if (abertaRef.current) return
      abertaRef.current = true
      document.documentElement.classList.add('au-aberta')
      evento(motivo === 'pitch' || motivo === 'retomada' ? 'pitch' : 'pitch', {
        rotulo: motivo,
      })
    },
    [evento]
  )

  /**
   * Cruzou o pitch. Libera o botão SOBRE o vídeo (trava separada da página) e
   * abre a página. Na primeira vez dá um empurrão de scroll, senão quem está
   * com o vídeo ocupando a tela não vê que apareceu conteúdo embaixo.
   */
  const marcarPitchVisto = useCallback(
    (motivo: 'pitch' | 'retomada') => {
      const primeira = !syncRef.current?.pitch_visto
      setCtaNoVideo(true)
      salvarSync({ pitch_visto: true })
      abrir(motivo)
      if (primeira && motivo === 'pitch') {
        window.setTimeout(() => window.scrollBy({ top: 150, behavior: 'smooth' }), 650)
      }
    },
    [abrir, salvarSync]
  )

  /* ── boot: sorteia a variante, resolve o estado salvo, anexa a fonte ── */
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    try {
      const chaveSid = `vsl_sid_${config.video_id}`
      let sid = sessionStorage.getItem(chaveSid)
      if (!sid) {
        sid = (crypto.randomUUID?.() ?? String(Math.random()).slice(2)) as string
        sessionStorage.setItem(chaveSid, sid)
      }
      sessao.current = sid
    } catch {
      sessao.current = String(Math.random()).slice(2)
    }

    const params = new URLSearchParams(window.location.search)
    const forcada = params.get('v')
    const pool = config.variantes.filter((v) => v.mp4 || v.hls)
    if (!pool.length) return

    const v =
      (forcada && pool.find((x) => String(x.versao_id) === forcada)) || sortear(pool, chaveAB)
    varianteRef.current = v
    setVariante(v)

    /* estado salvo só vale para a MESMA versão: posição de um corte não
       significa nada no outro, e "continuar" recomeçaria do zero. */
    let s: Sync | null = null
    try {
      const cru = JSON.parse(lerLS(chaveSync) || 'null')
      if (cru && typeof cru.t === 'number') s = cru
    } catch {}
    if (s && s.versao_id !== null && s.versao_id !== v.versao_id) {
      s = null
      try {
        localStorage.removeItem(chaveSync)
      } catch {}
    }
    syncRef.current = s
    salvarSync({ versao_id: v.versao_id })

    /* escape hatch de QA — fica em produção de propósito: ninguém descobre
       por acidente e facilita o suporte. */
    if (params.get('abrir') === '1') abrir('qa')

    /* quem já ouviu o preço não espera o vídeo inteiro de novo */
    if (s?.pitch_visto) marcarPitchVisto('retomada')
    if (s && s.t > 10) setCartao('retomada')

    /* velocidade preferida entre sessoes: quem assiste em 2x quer 2x sempre */
    const salva = parseFloat(lerLS('vsl_velocidade') || '1')
    if ([1, 1.5, 2].includes(salva) && salva !== 1) {
      setVelocidade(salva)
      video.playbackRate = salva
    }

    evento('carregou')

    /* ── anexar a fonte ──
       Safari toca HLS nativo; no Android o caminho nativo responde "maybe" e
       a implementação é historicamente ruim, então vai de hls.js. */
    const ua = navigator.userAgent
    const nativo =
      !!video.canPlayType('application/vnd.apple.mpegurl') && !/Android/i.test(ua)

    const marcarAnexada = () => {
      if (fonteAnexada.current) return
      fonteAnexada.current = true
      if (querComSom.current) iniciarComSom()
    }

    /** Último timeupdate recente = estava tocando. Não dá pra ler `paused`:
     *  o navegador pausa junto com o erro e o mp4 nunca voltava a tocar. */
    const estavaTocando = () => Date.now() - ultimoAndar.current < 3000

    const cairProMp4 = () => {
      if (!v.mp4) return
      const t = video.currentTime
      const tocava = estavaTocando()
      video.src = v.mp4
      video.load()
      /* quem está no minuto 12 de uma VSL não pode ser mandado pro começo */
      const voltar = () => {
        if (t > 0) video.currentTime = t
        if (tocava && !pausadoPeloUsuario.current) video.play().catch(() => {})
        video.removeEventListener('loadedmetadata', voltar)
      }
      video.addEventListener('loadedmetadata', voltar)
    }

    let hls: import('hls.js').default | null = null

    if (v.hls && nativo) {
      /* handler que se auto-remove ANTES de trocar a fonte: sem isso o erro
         re-dispara em laço no load() do mp4 */
      const nativoFalhou = () => {
        video.removeEventListener('error', nativoFalhou)
        cairProMp4()
      }
      video.addEventListener('error', nativoFalhou)
      video.src = v.hls
      marcarAnexada()
    } else if (v.hls) {
      import('hls.js')
        .then(({ default: Hls }) => {
          if (!Hls.isSupported()) {
            video.src = v.mp4
            marcarAnexada()
            return
          }
          hls = new Hls({
            /* teto de verdade: sem ele o hls.js puxa o vídeo inteiro de uma
               vez, gastando MAIS banda que o mp4 gastaria */
            maxMaxBufferLength: 60,
            maxBufferSize: 30 * 1000 * 1000,
            backBufferLength: 30,
            /* não baixa 1080 num player de 400px: mesma imagem, 5x a banda */
            capLevelToPlayerSize: true,
          })
          hls.on(Hls.Events.ERROR, (_e, dados) => {
            if (!dados.fatal) return
            try {
              hls?.destroy()
            } catch {}
            hls = null
            cairProMp4()
          })
          hls.loadSource(v.hls)
          hls.attachMedia(video)
          marcarAnexada()
        })
        .catch(() => {
          video.src = v.mp4
          marcarAnexada()
        })
    } else {
      video.src = v.mp4
      marcarAnexada()
    }

    return () => {
      try {
        hls?.destroy()
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** Autoplay mudo. Amarrado ao `loadeddata`: `play()` num <video> sem fonte
   *  rejeita e a página fica congelada no poster. */
  const tocarMudo = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    /* se a pessoa já ligou o som, NUNCA re-mutar: ela assistiria mudo achando
       que tem som e o play nunca contaria */
    if (comecou.current) return
    video.muted = true
    video.play().catch(() => {
      /* navegador recusou até mudo: o overlay de som vira o gatilho */
      setSemAutoplay(true)
    })
  }, [])

  const iniciarComSom = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    /* BUG DO TOQUE PERDIDO: se a fonte ainda não anexou, guardar a intenção.
       Sem isso o player fica morto e mudo até a pessoa recarregar. */
    if (!fonteAnexada.current) {
      querComSom.current = true
      setCarregando(true)
      return
    }

    setCarregando(false)
    setCartao(null)
    comecou.current = true
    setMostraControles(true)
    video.muted = false

    const s = syncRef.current
    const dur = video.duration || varianteRef.current?.duration_s || 0
    const retomar = s && s.t > 10 && (!dur || s.t < dur - 5) ? s.t : 0

    /* O UNMUTE REBOBINA — sempre, inclusive para 0.
       O autoplay mudo avança o relógio: se o som entrar de onde o mudo
       parou, a pessoa ouve do meio E o gate do pitch conta tempo que ela
       nunca ouviu. Com o rebobinar, currentTime pós-unmute é exatamente a
       posição realmente assistida, que é o que o gate mede. */
    video.currentTime = retomar
    /* seek antes da metadata é ignorado em silêncio pra quem clica rápido */
    const reseek = () => {
      if (Math.abs(video.currentTime - retomar) > 1.5) video.currentTime = retomar
    }
    video.addEventListener('loadedmetadata', reseek, { once: true })
    video.addEventListener('canplay', reseek, { once: true })

    if (rafRef.current === null) rafRef.current = requestAnimationFrame(pintarBarra)

    video
      .play()
      .then(() => evento(retomar > 0 ? 'retomou' : 'tocou_som', { segundo: Math.floor(retomar) }))
      .catch(() => {
        /* iOS em Low Power Mode recusa até no toque: desfaz e volta ao mudo */
        comecou.current = false
        video.muted = true
        setCartao('som')
        video.play().catch(() => {})
      })
  }, [evento, pintarBarra])

  /* ── listeners do vídeo ── */
  useEffect(() => {
    const video = videoRef.current
    if (!video || !variante) return

    const pitchS = variante.pitch_s > 0 ? variante.pitch_s : PITCH_REDE
    let ultimoSalvo = 0
    const quartis = new Set<number>()

    const onLoadedData = () => tocarMudo()

    const onTimeUpdate = () => {
      ultimoAndar.current = Date.now()
      const t = video.currentTime

      /* MUDO NÃO É ASSISTIR: sem este guard, aba aberta no mudo abre a oferta
         sem a pessoa ter ouvido um segundo. */
      if (video.muted || video.paused) return

      if (t >= pitchS) marcarPitchVisto('pitch')

      const dur = video.duration || variante.duration_s || 0
      if (dur > 0) {
        for (const q of [25, 50, 75]) {
          if (!quartis.has(q) && t >= (dur * q) / 100) {
            quartis.add(q)
            evento('quartil', { segundo: Math.floor(t), rotulo: String(q) })
          }
        }
      }

      if (Math.abs(t - ultimoSalvo) >= 3) {
        ultimoSalvo = t
        salvarSync({ t: Math.floor(t) })
      }
    }

    const onPause = () => {
      /* nada de cartão no fim do vídeo nem em pausa técnica de aba escondida */
      if (comecou.current && !video.ended && !document.hidden) setCartao('pausa')
    }
    const onPlay = () => setCartao((c) => (c === 'pausa' ? null : c))
    const onEnded = () => {
      if (barraRef.current) barraRef.current.style.width = '100%'
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      evento('fim', { segundo: Math.floor(video.currentTime) })
    }
    /* menu de contexto no vídeo entrega "salvar vídeo" */
    const onContext = (e: Event) => e.preventDefault()

    video.addEventListener('loadeddata', onLoadedData)
    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('pause', onPause)
    video.addEventListener('play', onPlay)
    video.addEventListener('ended', onEnded)
    video.addEventListener('contextmenu', onContext)

    /* REDE ESTREITADA: só FALHA REAL do vídeo abre sem pitch. Inação não abre
       — era isso que punha botão de compra na frente de quem não assistiu. */
    const rede = window.setInterval(() => {
      if (abertaRef.current) {
        window.clearInterval(rede)
        return
      }
      if (video.error && Date.now() - ultimoAndar.current >= 60000) {
        window.clearInterval(rede)
        abrir('rede')
      }
    }, 5000)

    /* autoplay bloqueado (iOS): a copy não pode afirmar "seu vídeo já começou"
       diante de uma imagem parada */
    const relogioCopy = window.setTimeout(() => {
      if (!comecou.current && video.paused) setSemAutoplay(true)
    }, 1800)

    const onSaida = () => evento('quartil', { segundo: Math.floor(video.currentTime), rotulo: 'saiu' })
    window.addEventListener('pagehide', onSaida)

    return () => {
      video.removeEventListener('loadeddata', onLoadedData)
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('play', onPlay)
      video.removeEventListener('ended', onEnded)
      video.removeEventListener('contextmenu', onContext)
      window.removeEventListener('pagehide', onSaida)
      window.clearInterval(rede)
      window.clearTimeout(relogioCopy)
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [variante, abrir, evento, marcarPitchVisto, salvarSync, tocarMudo])

  /* anel de carga: carência de 250ms, senão pisca no wi-fi e vira ruído */
  useEffect(() => {
    if (!variante) return
    const video = videoRef.current
    const id = window.setTimeout(() => {
      if (video && video.readyState < 3) setAnel(true)
    }, 250)
    const pronto = () => setAnel(false)
    video?.addEventListener('canplay', pronto)
    return () => {
      window.clearTimeout(id)
      video?.removeEventListener('canplay', pronto)
    }
  }, [variante])

  /* thumb em loop enquanto o vídeo principal carrega. Qualquer erro devolve o
     comportamento padrão: a thumb nunca pode quebrar o play. */
  const thumbUrl = config.fixos?.thumb?.arquivo_url || null
  const [thumbNoAr, setThumbNoAr] = useState(!!thumbUrl)

  /* observação de checkout: clique em qualquer plano vira evento */
  useEffect(() => {
    const onClique = (e: MouseEvent) => {
      const alvo = (e.target as HTMLElement | null)?.closest('[data-checkout]')
      if (!alvo) return
      evento('clicou_cta', { rotulo: alvo.getAttribute('data-checkout') || '' })
    }
    document.addEventListener('click', onClique)
    return () => document.removeEventListener('click', onClique)
  }, [evento])

  /* a dobra de planos entrando na tela conta como "viu a oferta" */
  useEffect(() => {
    const alvo = document.getElementById('planos')
    if (!alvo || typeof IntersectionObserver === 'undefined') return
    let disparado = false
    const obs = new IntersectionObserver(
      (entradas) => {
        for (const en of entradas) {
          if (en.isIntersecting && !disparado) {
            disparado = true
            evento('abriu_oferta')
            obs.disconnect()
          }
        }
      },
      { threshold: 0.3 }
    )
    obs.observe(alvo)
    return () => obs.disconnect()
  }, [evento])

  /* O botão de WhatsApp só existe se houver número no config: um link pra
     lugar nenhum é pior que link nenhum. A mensagem já vem escrita com a
     origem, que é o que permite saber depois que o lead veio da /aula. */
  const zap = config.whatsapp
  const linkZap =
    zap?.numero && zap.numero.replace(/\D/g, '').length >= 12
      ? 'https://wa.me/' + zap.numero.replace(/\D/g, '') +
        '?text=' + encodeURIComponent(zap.mensagem || 'Oi!')
      : null

  const fx = config.fixos || {}
  const tarja = fx.tarja
  const semHeadline = fx.headline?.sem_headline
  const h1 = fx.headline?.h1 || 'Uma pessoa. O trabalho de dez.'
  const sub =
    fx.headline?.sub ||
    'Neste vídeo eu rodo a mesma IA de dois jeitos, no mesmo dia, com a mesma frase, e mostro as quatro coisas que eu dei pra ela sair do chat e ir trabalhar dentro do meu negócio.'

  return (
    <section className="au-hero">
      {/* o eyebrow fica mesmo sem headline: no funil de origem a dobra de
          trafego e uma linha de posicionamento + o video. O que sai e a
          headline e o subtitulo, que comem a dobra e empurram o player. */}
      <span className="au-eyebrow">Push Club</span>
      {!semHeadline && <h1 className="au-h1">{h1}</h1>}

      {/* Tarja no FLUXO, nunca fixed nem sobreposta ao vídeo: a auditoria do
          funil de origem mediu que 99% da decisão acontece nos 2-3 primeiros
          segundos de imagem, e empurrar o player custaria justamente ali.
          Altura fixa entre os braços, senão parte da diferença medida seria
          layout e não mensagem. */}
      {tarja?.texto && (
        <div className={'au-tarja' + (tarja.cor === 'vermelho' ? ' vermelha' : '')}>
          {tarja.icone === 'alerta' && (
            <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden focusable="false">
              <path
                fill="currentColor"
                d="M12 2 1 21h22L12 2Zm0 5 7.5 12.9h-15L12 7Zm-1 4v5h2v-5h-2Zm0 6v2h2v-2h-2Z"
              />
            </svg>
          )}
          <span className={tarja.pulsa ? 'pulso' : undefined}>{tarja.texto}</span>
        </div>
      )}

      <div
        className="au-player"
        onClick={() => {
          if (!comecou.current) {
            iniciarComSom()
            return
          }
          const video = videoRef.current
          if (!video) return
          if (video.paused) {
            pausadoPeloUsuario.current = false
            video.play().catch(() => {})
          } else {
            pausadoPeloUsuario.current = true
            video.pause()
          }
        }}
      >
        {thumbUrl && thumbNoAr && (
          <video
            ref={thumbRef}
            src={thumbUrl}
            muted
            loop
            playsInline
            autoPlay
            onError={() => setThumbNoAr(false)}
            style={{ zIndex: 2 }}
          />
        )}

        <video
          ref={videoRef}
          poster={variante?.poster || undefined}
          playsInline
          preload="auto"
          controlsList="nodownload nofullscreen noremoteplayback"
          disablePictureInPicture
        />

        {/* velocidade: só depois que o som liga, junto com os outros controles.
            O clique não pode borbulhar pro player, senão pausa o vídeo. */}
        {mostraControles && (
          <button
            type="button"
            className="au-vel"
            aria-label={'Velocidade do vídeo: ' + velocidade + 'x. Tocar para mudar.'}
            onClick={(e) => {
              e.stopPropagation()
              const proxima = velocidade === 1 ? 1.5 : velocidade === 1.5 ? 2 : 1
              setVelocidade(proxima)
              if (videoRef.current) videoRef.current.playbackRate = proxima
              gravarLS('vsl_velocidade', String(proxima))
              evento('quartil', {
                segundo: Math.floor(videoRef.current?.currentTime || 0),
                rotulo: 'velocidade ' + proxima + 'x',
              })
            }}
          >
            {velocidade}x
          </button>
        )}

        {anel && <span className="au-anel" aria-hidden />}

        {cartao === 'som' && (
          <div className="au-cartao">
            <span className="eyebrow">{fx.overlay?.eyebrow || 'ATIVE O SOM'}</span>
            <span className="grande pulso">{fx.overlay?.sub || '▶ TOQUE PARA OUVIR'}</span>
            <span className="apoio">
              {carregando
                ? 'Carregando…'
                : semAutoplay
                  ? 'Toque para começar a aula'
                  : 'Seu vídeo já começou, mas está sem som'}
            </span>
          </div>
        )}

        {cartao === 'retomada' && (
          <div className="au-cartao">
            <span className="eyebrow">Você já começou a assistir</span>
            <button
              type="button"
              className="au-pill"
              onClick={(e) => {
                e.stopPropagation()
                iniciarComSom()
              }}
            >
              ▶ Continuar de onde parei
            </button>
            <button
              type="button"
              className="au-pill ghost"
              onClick={(e) => {
                e.stopPropagation()
                /* zera a posição mas PRESERVA pitch_visto: quem já ouviu o
                   preço não perde o botão por reassistir do começo */
                salvarSync({ t: 0 })
                evento('reiniciou')
                iniciarComSom()
              }}
            >
              ↺ Assistir do início
            </button>
          </div>
        )}

        {cartao === 'pausa' && (
          <div className="au-cartao">
            <span className="eyebrow">Sua aula está só pausada</span>
            <span className="apoio">
              O que vem agora é a parte que muda o que você faz na segunda-feira.
            </span>
            <span className="grande">▶ Continuar assistindo</span>
          </div>
        )}

        {/* botão do pitch, SOBRE o vídeo: trava separada da página, e absolute
            pra não empurrar o player quando aparece */}
        {ctaNoVideo && (
          <div className="au-sobre">
            <a
              href="#planos"
              className="au-pill bloco"
              onClick={(e) => e.stopPropagation()}
            >
              Entrar no Push Club →
            </a>
          </div>
        )}

        <div className="au-progresso" aria-hidden>
          <i ref={barraRef as React.RefObject<HTMLElement>} />
        </div>
      </div>

      {!semHeadline && <p className="au-sub">{sub}</p>}

      {/* nada de texto na dobra fechada: pagina de trafego e o video. A nota
          so existe depois que a pagina abre, pra apontar pra oferta. */}
      {ctaNoVideo && <p className="au-nota">A oferta está logo abaixo.</p>}

      {linkZap && (
        <a
          className="au-zap"
          href={linkZap}
          target="_blank"
          rel="noopener"
          onClick={() =>
            evento('clicou_whats', {
              segundo: Math.floor(videoRef.current?.currentTime || 0),
              rotulo: abertaRef.current ? 'aberta' : 'fechada',
            })
          }
        >
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden focusable="false">
            <path
              fill="currentColor"
              d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.1-.2 0-.4.1-.5l.4-.5.2-.4v-.4l-.7-1.7c-.2-.4-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3c-.3.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.2.7 3 .6.5 0 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1l-.4-.2Z"
            />
          </svg>
          {zap?.rotulo || 'Falar com a IA de vendas'}
        </a>
      )}
    </section>
  )
}
