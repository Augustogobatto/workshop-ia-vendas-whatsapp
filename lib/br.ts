/**
 * Telefone, CPF e e-mail brasileiros — as regras que o popup e o servidor
 * precisam enxergar do MESMO jeito. Sem dependência de DOM: roda no cliente
 * e na rota de API.
 *
 * A parte do telefone é a da skill `rastreio-checkout`, e a regra que importa
 * é uma só: **tirar o `55` do país só quando sobram mais de 11 dígitos**.
 * Cortar `55` de cara mutila os números de Santa Maria/RS, cujo DDD é 55 —
 * `+55 55 99174-8215` viraria `(99) 1748-215`. Já custou lead capturado que
 * nunca recebeu mensagem (Missão Raiz, 10/08/2026).
 */

/** Dígitos nacionais (DDD + número), no máximo 11. Autofill do navegador entra aqui. */
export function telDigitos(v: string): string {
  let d = String(v || '').replace(/\D/g, '')
  if (d.length > 11 && d.startsWith('55')) d = d.slice(2)
  while (d.startsWith('0')) d = d.slice(1)
  return d.slice(0, 11)
}

/** `(48) 99174-8215` na tela. Fixo de 10 dígitos vira `(48) 3225-1234`. */
export function telFormatado(v: string): string {
  const d = telDigitos(v)
  if (d.length <= 2) return d
  const corte = d.length > 10 ? 7 : 6
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, corte)}-${d.slice(corte)}`
}

/** 10 ou 11 dígitos. Menos que isso não é telefone. */
export function telValido(v: string): boolean {
  return telDigitos(v).length >= 10
}

/** E.164 sem `+`, como o backend do Asaas e a tabela `leads` esperam: `5548991748215`. */
export function telE164(v: string): string {
  const d = telDigitos(v)
  return d.length >= 10 ? '55' + d : ''
}

/**
 * Todas as formas em que o mesmo número pode estar gravado em `leads`:
 * com e sem `+`, com e sem o 9º dígito. A variante sem o 9 existe por causa
 * do lead duplicado do Elton (27/07) — a base tem os dois formatos, e o
 * `leads.phone` grava tanto `+5548…` quanto `5548…`.
 */
export function telVariantes(e164: string): string[] {
  const d = String(e164 || '').replace(/\D/g, '')
  if (d.length < 12 || !d.startsWith('55')) return []
  const nacional = d.slice(2) // DDD + número
  const ddd = nacional.slice(0, 2)
  const numero = nacional.slice(2)
  const formas = new Set<string>([d])
  if (numero.length === 9 && numero.startsWith('9')) formas.add('55' + ddd + numero.slice(1))
  if (numero.length === 8) formas.add('55' + ddd + '9' + numero)
  const todas: string[] = []
  formas.forEach((f) => {
    todas.push(f, '+' + f)
  })
  return todas
}

export function cpfDigitos(v: string): string {
  return String(v || '').replace(/\D/g, '').slice(0, 11)
}

export function cpfFormatado(v: string): string {
  const d = cpfDigitos(v)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

/** Dígito verificador de verdade. O Asaas recusa a autorização com CPF torto. */
export function cpfValido(v: string): boolean {
  const d = cpfDigitos(v)
  if (d.length !== 11) return false
  if (/^(\d)\1{10}$/.test(d)) return false
  for (const corte of [9, 10]) {
    let soma = 0
    for (let i = 0; i < corte; i++) soma += Number(d[i]) * (corte + 1 - i)
    let dv = (soma * 10) % 11
    if (dv === 10) dv = 0
    if (dv !== Number(d[corte])) return false
  }
  return true
}

/** Checagem básica: existe @, tem ponto no domínio, sem espaço. O resto quem diz é a caixa. */
export function emailValido(v: string): boolean {
  const t = String(v || '').trim()
  return t.length >= 6 && t.length <= 160 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t)
}
