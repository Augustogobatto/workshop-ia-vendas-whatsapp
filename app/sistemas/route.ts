import { readFileSync } from 'fs'
import { join } from 'path'
import { NextResponse } from 'next/server'

// Serve o material de apoio do vídeo "10 sistemas com Claude" em /sistemas
export async function GET() {
  const html = readFileSync(join(process.cwd(), 'public', 'sistemas.html'), 'utf-8')
  return new NextResponse(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
    },
  })
}
