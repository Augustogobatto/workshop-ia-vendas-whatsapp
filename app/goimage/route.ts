import { readFileSync } from 'fs'
import { join } from 'path'
import { NextResponse } from 'next/server'

// Serve o dossiê de conversas reais da Go Image (prova de que a IA reconhece o limite) em /goimage
export async function GET() {
  const html = readFileSync(join(process.cwd(), 'public', 'goimage.html'), 'utf-8')
  return new NextResponse(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'x-robots-tag': 'noindex, nofollow',
    },
  })
}
