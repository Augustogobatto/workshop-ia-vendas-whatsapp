import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

/* O middleware roda em TODA request de /members/*, e a única coisa de rede que
   ele faz é perguntar ao Supabase quem é o usuário. Em 11/09/2026 o banco caiu
   (CPU estourada no t4g.nano): o Auth passou a devolver 504, o SDK retentou com
   backoff, e a Vercel matou a invocação em 25s — o membro via um 504
   MIDDLEWARE_INVOCATION_TIMEOUT no lugar da área de membros.

   Duas travas contra isso: prazo na rede (AbortSignal) e prazo no total, que
   fecha a porta pro retry interno do SDK. Estourando o prazo, o middleware
   NÃO redireciona e deixa a request seguir: o layout de (app) revalida a
   sessão no servidor e manda pro login quem não tiver, e os dados vêm por RLS.
   Ou seja, o pior caso é a página decidir em vez do middleware — nunca a área
   inteira fora do ar. */
const PRAZO_FETCH_MS = 2500
const PRAZO_TOTAL_MS = 3500

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: (input: RequestInfo | URL, init?: RequestInit) =>
          fetch(input, { ...init, signal: AbortSignal.timeout(PRAZO_FETCH_MS) }),
      },
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  /* 'indisponivel' é diferente de "não tem sessão": no primeiro caso a gente
     não sabe, e quem não sabe não desloga ninguém nem barra ninguém. */
  const ESTOUROU = Symbol('prazo')
  let user: User | null = null
  let sabemos = true

  try {
    const resultado = await Promise.race([
      supabase.auth.getUser(),
      new Promise<typeof ESTOUROU>((resolve) =>
        setTimeout(() => resolve(ESTOUROU), PRAZO_TOTAL_MS)
      ),
    ])
    if (resultado === ESTOUROU) sabemos = false
    else user = resultado.data.user
  } catch {
    sabemos = false
  }

  if (!sabemos) return supabaseResponse

  const isLoginPage = request.nextUrl.pathname === '/members/login'
  const isMembersArea = request.nextUrl.pathname.startsWith('/members')

  // Protect members area: no session → login
  if (isMembersArea && !isLoginPage && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/members/login'
    return NextResponse.redirect(url)
  }

  // Already logged in: login page → dashboard
  if (isLoginPage && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/members'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/members/:path*'],
}
