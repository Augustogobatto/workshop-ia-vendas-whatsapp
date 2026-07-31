import { readFileSync } from 'fs'
import { join } from 'path'
import { NextResponse } from 'next/server'

// Serve o caso da venda feita pela IA (conversa real da Camila/ELA) em /ia-vende
export async function GET() {
  const html = readFileSync(join(process.cwd(), 'public', 'ia-vende.html'), 'utf-8')
  return new NextResponse(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'x-robots-tag': 'noindex, nofollow',
    },
  })
}
