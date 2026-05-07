# IA Revolution — Área de Membros

Projeto Next.js 14 que serve duas coisas no mesmo deploy:
- `/` → landing page do Workshop (HTML estático servido por `app/route.ts`)
- `/members/*` → área de membros completa com auth, dashboard e player de aulas

**Produção:** https://ia.augustogobatto.com  
**Vercel project:** `workshop-ia-vendas` (`prj_MZnYaMBqpJ0cCJ4hwkn8EYih9JYP`)  
**Supabase project:** `edbhhijnpwgmksxnjzrr`

---

## Stack

- Next.js 14 (App Router)
- TypeScript + Tailwind CSS
- Supabase (`@supabase/ssr`) — auth + banco de dados
- Deploy: Vercel

---

## Estrutura de arquivos

```
app/
  route.ts                          # serve public/workshop.html em /
  layout.tsx                        # root layout (fontes Barlow Condensed + Onest)
  globals.css                       # design system completo (CSS vars, animações)
  members/
    login/page.tsx                  # login/signup — 'use client'
    (app)/
      layout.tsx                    # layout protegido: verifica sessão + renderiza Sidebar
      page.tsx                      # dashboard — lista cursos do usuário
      [product-slug]/
        page.tsx                    # página do curso — módulos e aulas
        [module-slug]/
          [lesson-slug]/
            page.tsx                # player de aula — 'use client'

components/
  sidebar.tsx                       # sidebar de navegação — 'use client'
  product-cards.tsx                 # cards de produto (owned/locked) — 'use client'
  lesson-row.tsx                    # linha de aula com ícone de progresso — 'use client'

lib/
  supabase/
    client.ts                       # createBrowserClient (usar em 'use client')
    server.ts                       # createServerClient com cookies (usar em Server Components)
    types.ts                        # interfaces: Lead, CatalogProduct, Module, Lesson, etc.
  utils.ts                          # getGreeting, formatDuration, formatPrice, cn

middleware.ts                       # protege /members/*, redireciona login↔dashboard
```

---

## Autenticação

**Método:** OTP numérico de 8 dígitos (não magic link).

Por que OTP e não magic link: o magic link no Next.js App Router com `@supabase/ssr` tem bugs conhecidos de cookie não viajar no redirect e whitespace em `emailRedirectTo`. OTP elimina o `/auth/callback` inteiro.

**Fluxo:**
1. Usuário digita email (+ nome e WhatsApp no modo "Criar conta")
2. `supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: mode === 'signup', data: { name, phone } } })`
3. Supabase envia email com código de 8 dígitos
4. Usuário digita o código
5. `supabase.auth.verifyOtp({ email, token, type: 'email' })` → sessão criada
6. `router.push('/members')` → middleware valida cookie → acesso liberado

**`shouldCreateUser`:**
- Modo "Criar conta" → `true`
- Modo "Já tenho conta" → `false` (evita criar usuário duplicado)

**Sem `/auth/callback`** — esse route foi removido, não existe mais no projeto.

---

## Banco de dados (Supabase)

**Tabelas principais:**
- `leads` — perfil do usuário (name, first_name, phone, email, auth_user_id)
- `products` — cursos/workshops disponíveis
- `modules` — módulos de cada produto
- `lessons` — aulas de cada módulo (content_type: video | loom | text | embed | pdf)
- `lesson_progress` — progresso por aula (status: not_started | in_progress | completed)

**RPC:**
- `get_catalog_with_access` — retorna todos os produtos com flag `has_access` para o usuário logado
- `get_lesson(p_lesson_slug, p_module_slug, p_product_slug)` — retorna conteúdo da aula com verificação de acesso

**Trigger automático:**
- `on_auth_user_created` → função `handle_new_user`
- Quando um usuário é criado via OTP, o trigger cria/atualiza automaticamente o registro em `leads`
- Lê `name` e `phone` de `raw_user_meta_data` (enviados no `signInWithOtp`)
- Busca lead existente por email, depois por phone — só cria novo se não achar

---

## Design system

Tema dark com acento verde neon. Definido inteiramente em CSS vars em `globals.css`.

**Cores principais:**
```css
--bg: #0A0C0A          /* fundo base */
--bg-2: #111511        /* cards, sidebar */
--surface: #1A221A     /* hover state */
--green: #00FF88       /* acento principal */
--text: #EDEFEC
--text-muted: #7A8678
--border: #1E271E
```

**Tipografia:**
- Display: `Space Grotesk` (títulos, botões, labels uppercase)
- UI: `Inter` (corpo, inputs)

**Regra importante — Server Components:**
Event handlers (`onMouseEnter`, `onMouseLeave`, `onClick`) não podem estar em Server Components. Regra geral:
- Componentes com hover de JS → arquivo separado com `'use client'`
- Hover simples de cor → usar CSS class `.link-muted` (definida em globals.css)

---

## Middleware

`middleware.ts` intercepta todas as rotas `/members/*`:
- Sem sessão → redireciona para `/members/login`
- Em `/members/login` com sessão → redireciona para `/members`
- Chama `supabase.auth.getUser()` para validar e renovar o token

---

## Variáveis de ambiente

```
NEXT_PUBLIC_SUPABASE_URL=https://edbhhijnpwgmksxnjzrr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Configuradas no `.env.local` (local) e no painel do Vercel (produção).
