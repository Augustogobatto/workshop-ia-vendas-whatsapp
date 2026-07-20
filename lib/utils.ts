export function formatDuration(seconds: number | null): string {
  if (!seconds) return ''
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m === 0) return `${s}s`
  if (s === 0) return `${m}min`
  return `${m}min ${s}s`
}

export function formatPrice(cents: number | null): string {
  if (!cents) return ''
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100)
}

export function getGreeting(name?: string | null): string {
  const h = new Date().getHours()
  const parte = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
  return name ? `${parte}, ${name.split(' ')[0]}` : parte
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Normaliza telefone BR pra formato canônico +55DDDNÚMERO.
 * Aceita "+55 (48) 99174-8215", "48 991748215", "5548991748215" etc.
 * Retorna null se não conseguir formar um número BR válido (10-11 dígitos após DDI).
 */
export function normalizePhoneBR(raw: string): string | null {
  let d = raw.replace(/\D/g, '')
  if (d.startsWith('00')) d = d.slice(2)
  if (d.startsWith('55') && d.length >= 12) d = d.slice(2)
  if (d.length === 10 || d.length === 11) {
    const ddd = parseInt(d.slice(0, 2), 10)
    if (ddd >= 11 && ddd <= 99) return `+55${d}`
  }
  return null
}
