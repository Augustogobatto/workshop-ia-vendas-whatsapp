import { readFileSync } from 'fs'
import { join } from 'path'
import { NextResponse } from 'next/server'

// Manual do operador: como disparar template no WhatsApp do Edital pelo Chatwoot
export async function GET() {
  const html = readFileSync(join(process.cwd(), 'public', 'disparos.html'), 'utf-8')
  return new NextResponse(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'x-robots-tag': 'noindex, nofollow',
    },
  })
}
