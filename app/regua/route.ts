import { readFileSync } from 'fs'
import { join } from 'path'
import { NextResponse } from 'next/server'

// Serve a Régua dos 12 Números (diagnóstico das 12 razões do Hormozi) em /regua
export async function GET() {
  const html = readFileSync(join(process.cwd(), 'public', 'regua.html'), 'utf-8')
  return new NextResponse(html, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  })
}
