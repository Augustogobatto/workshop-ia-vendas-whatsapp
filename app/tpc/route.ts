import { readFileSync } from 'fs'
import { join } from 'path'
import { NextResponse } from 'next/server'

// Serve o parecer do TPC Club (proposta de consultoria) em /tpc
export async function GET() {
  const html = readFileSync(join(process.cwd(), 'public', 'tpc.html'), 'utf-8')
  return new NextResponse(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'x-robots-tag': 'noindex, nofollow',
    },
  })
}
