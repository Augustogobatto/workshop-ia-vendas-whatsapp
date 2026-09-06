import { readFileSync } from 'fs'
import { join } from 'path'
import { NextResponse } from 'next/server'

// Serve o mapa mental dos negócios (Mind Elixir, salva no navegador) em /mapa
export async function GET() {
  const html = readFileSync(join(process.cwd(), 'public', 'mapa.html'), 'utf-8')
  return new NextResponse(html, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  })
}
