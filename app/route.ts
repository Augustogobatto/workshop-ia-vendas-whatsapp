import { readFileSync } from 'fs'
import { join } from 'path'
import { NextResponse } from 'next/server'

// Serve a landing page do Workshop em /
export async function GET() {
  const html = readFileSync(join(process.cwd(), 'public', 'workshop.html'), 'utf-8')
  return new NextResponse(html, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  })
}
