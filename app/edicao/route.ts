import { readFileSync } from 'fs'
import { join } from 'path'
import { NextResponse } from 'next/server'

// Serve o bastidor da edição por IA (caminho das pedras) em /edicao
export async function GET() {
  const html = readFileSync(join(process.cwd(), 'public', 'edicao.html'), 'utf-8')
  return new NextResponse(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
    },
  })
}
