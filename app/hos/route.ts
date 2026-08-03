import { readFileSync } from 'fs'
import { join } from 'path'
import { NextResponse } from 'next/server'

// Serve a proposta da HOS Sistemas (consultoria de prospecção com IA) em /hos
export async function GET() {
  const html = readFileSync(join(process.cwd(), 'public', 'hos.html'), 'utf-8')
  return new NextResponse(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'x-robots-tag': 'noindex, nofollow',
    },
  })
}
