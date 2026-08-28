import { readFileSync } from 'fs'
import { join } from 'path'
import { NextResponse } from 'next/server'

// Venda de R$297 fechada pela IA (Maísa/TrazpraCá Club) em /ia-vende-marlei
export async function GET() {
  const html = readFileSync(join(process.cwd(), 'public', 'ia-vende-marlei.html'), 'utf-8')
  return new NextResponse(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'x-robots-tag': 'noindex, nofollow',
    },
  })
}
