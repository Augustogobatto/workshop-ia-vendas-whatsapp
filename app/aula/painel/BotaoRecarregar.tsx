'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Recarregar com resposta visual.
 *
 * A versão anterior era um submit de form: a página recarregava em
 * milissegundos, nada mudava na tela e o clique parecia não ter feito nada.
 * Aqui o `useTransition` dá o estado pendente do `router.refresh()`, então dá
 * pra mostrar "Atualizando…" enquanto acontece e um "pronto" depois, que some
 * sozinho. Sem isso o botão é um placebo.
 */
export default function BotaoRecarregar({
  idadeMin,
  velho,
}: {
  idadeMin: number | null
  velho: boolean
}) {
  const router = useRouter()
  const [pendente, iniciar] = useTransition()
  const [feito, setFeito] = useState<string | null>(null)

  /* o "pronto" só aparece quando a transição termina, e some em 3s */
  useEffect(() => {
    if (!feito) return
    const id = setTimeout(() => setFeito(null), 3000)
    return () => clearTimeout(id)
  }, [feito])

  function recarregar() {
    setFeito(null)
    iniciar(() => {
      router.refresh()
      setFeito(
        new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      )
    })
  }

  const rotulo = pendente
    ? 'Atualizando…'
    : feito
      ? 'Atualizado'
      : 'Recarregar'

  const detalhe = pendente
    ? 'buscando'
    : feito
      ? `às ${feito}`
      : idadeMin === null
        ? 'sem mídia'
        : idadeMin <= 1
          ? 'Meta agora há pouco'
          : `Meta há ${idadeMin} min`

  return (
    <button
      type="button"
      onClick={recarregar}
      disabled={pendente}
      className={
        'pn-btn' +
        (velho && !pendente && !feito ? ' alerta' : '') +
        (pendente ? ' rodando' : '') +
        (feito ? ' ok' : '')
      }
      aria-live="polite"
    >
      <span className="giro" aria-hidden>
        {feito && !pendente ? '✓' : '↻'}
      </span>
      {rotulo}
      <small>{detalhe}</small>
    </button>
  )
}
