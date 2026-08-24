import { readFileSync } from 'fs'
import { join } from 'path'
import { NextResponse } from 'next/server'

// Serve o estudo de segmentação amador × profissional da Go Image em /goimage/amador
export async function GET() {
  const html = readFileSync(join(process.cwd(), 'public', 'goimage-amador.html'), 'utf-8')
  return new NextResponse(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'x-robots-tag': 'noindex, nofollow',
    },
  })
}
