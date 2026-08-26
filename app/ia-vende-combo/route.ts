import { readFileSync } from 'fs'
import { join } from 'path'
import { NextResponse } from 'next/server'

// Combo de 4 vendas fechadas pela IA (Camila/ELA) em /ia-vende-combo
export async function GET() {
  const html = readFileSync(join(process.cwd(), 'public', 'ia-vende-combo.html'), 'utf-8')
  return new NextResponse(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'x-robots-tag': 'noindex, nofollow',
    },
  })
}
