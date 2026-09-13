import { readFileSync } from 'fs'
import { join } from 'path'
import { NextResponse } from 'next/server'

// Serve o contador de truco (Nosotros × Ellos) em /truco.
// Página solta, sem React: o placar é 100% client-side (localStorage + canvas
// da madeira), então não há nada pra renderizar no servidor.
export async function GET() {
  const html = readFileSync(join(process.cwd(), 'public', 'truco.html'), 'utf-8')
  return new NextResponse(html, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  })
}
