import { readFileSync } from 'fs'
import { join } from 'path'
import { NextResponse } from 'next/server'

// Serve a calculadora de decisão por valor esperado (Pascal/Fermat) em /aposta
export async function GET() {
  const html = readFileSync(join(process.cwd(), 'public', 'aposta.html'), 'utf-8')
  return new NextResponse(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
    },
  })
}
