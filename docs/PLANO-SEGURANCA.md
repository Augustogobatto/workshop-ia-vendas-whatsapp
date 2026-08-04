# Plano de revisão de segurança do Club

Criado em 2026-08-04. Alvo: `club-site` (Next.js 14 App Router + Supabase `edbhhijnpwgmksxnjzrr`), área de membros em ia.augustogobatto.com.

Origem: comparação com a área de membros da Elite da IA (que usa Bunny Stream com URL assinada) revelou que, no Club, a segurança do conteúdo pago está pendurada em duas coisas frágeis (RLS da tabela `lessons` e o segredo da URL do Loom), e que o código fura o próprio portão de acesso ao ler `content_url` direto da tabela no cliente.

## Regra da casa

Nenhum item é respondido de cabeça. Cada um tem um comando ou teste. Veredito só entre `ok`, `furado`, `não se aplica`, `não verificado`. Nada de "considere implementar": ou está furado e conserta, ou está ok.

## Três motores de revisão

- **A. `/security-review`** (automatizado, roda dentro do repo): varre o diff/repo procurando injection, segredo exposto, falha de autorização em rota. Disparar com `cd ~/Desktop/VPS/club-site && /security-review`.
- **B. `superpowers:requesting-code-review`** (subagente revisor): despacha um `general-purpose` com contexto cirúrgico (descrição, requisitos, `BASE_SHA`, `HEAD_SHA`) usando o template `code-reviewer.md`. Devolve Strengths + Issues (Critical/Important/Minor) + Assessment. Usado pra revisar cada conserto de segurança antes de deployar, sem queimar o contexto principal.
- **C. `auditoria-seguranca`** (skill da VPS, manual, verificada por comando): os 6 clássicos, as 2 perguntas de ouro e as lições do incidente do CEQ, adaptados ao stack do Club.

Divisão de trabalho: **A** é a rede automatizada de varredura, **C** é a checklist manual verificada por comando (é a que gera o veredito por item), e **B** revisa o *diff dos consertos* que as fases geram (a RLS nova, o select corrigido, os headers) antes de subir pra produção.

## Mapa de superfície (o que revisar)

Rotas sensíveis: `/members/*` (middleware), `/api/mcp/[transport]`, `/api/ceq/validate`, `/auth/callback`, server actions de `conectar-claude` e `welcome`.

Tabelas tocadas pelo código (cada uma precisa de veredito de RLS): `lessons`, `products`, `modules`, `leads`, `purchases`, `lesson_progress`, `mcp_tokens`, `mcp_usage`, `lesson_transcriptions`, `banners`, `checklist_progress`, `vendas_ai_mensagens`, `ceq_instancias`, mais a tabela de chunks por trás de `match_lesson_chunks_published`.

RPCs a auditar: `get_lesson`, `get_catalog_with_access`, `is_club_active`, `match_lesson_chunks_published`.

---

## Fase 1 — CRÍTICO: estancar o vazamento de conteúdo pago

O resto do plano não importa se um curso pago vaza. Esta fase vem primeiro.

### 1.1 Confirmar o estado da RLS (a variável que decide tudo)

Duas formas, fazer as duas:

- **Ler as políticas** no SQL editor do Supabase do Club:
  ```sql
  select relname, relrowsecurity
  from pg_class where relname in
  ('lessons','products','modules','leads','purchases','lesson_progress',
   'mcp_tokens','mcp_usage','lesson_transcriptions','banners',
   'checklist_progress','vendas_ai_mensagens','ceq_instancias');
  select schemaname, tablename, policyname, roles, cmd, qual
  from pg_policies where schemaname='public' order by tablename;
  ```
  Veredito por tabela: RLS ligada? A policy de SELECT em `lessons` amarra a `purchases`/`is_club_active`, ou libera pra qualquer `authenticated`?

- **Teste de dump como usuário grátis** (a prova de fogo, porque o cadastro é aberto):
  1. Criar conta nova por OTP (qualquer e-mail), sem comprar nada.
  2. Pegar o access token da sessão no DevTools.
  3. Bater direto na API:
     ```
     GET https://edbhhijnpwgmksxnjzrr.supabase.co/rest/v1/lessons?select=content_url,content_body,is_published
     Authorization: Bearer <token do usuário grátis>
     apikey: <anon key>
     ```
  4. Se vier `content_url`/`content_body` de curso pago: **furado, incêndio ativo**. Se vier vazio/403: RLS ok, seguir mesmo assim com 1.2 (defesa em profundidade).

### 1.2 Fechar o furo do portão no código

Independente do resultado de 1.1, corrigir a arquitetura:

- A página de aula (`app/members/(app)/[product-slug]/[module-slug]/[lesson-slug]/page.tsx`) lê `content_url` e `content_body` de **todas** as aulas do curso via `.from('lessons').select(...)` só filtrando `is_published`, pra montar o menu lateral. O menu não precisa de `content_url` nem `content_body`: precisa só de `name, slug, sort_order, content_type, duration_seconds, is_free, is_published`. **Remover os dois campos sensíveis desse select.**
- Conteúdo sensível (`content_url`, `content_body`) só pode sair pelo RPC `get_lesson`, que já checa acesso. Um único caminho de acesso, nunca um `select` paralelo.
- Garantir RLS ligada e escopada a `purchases`/`is_club_active` em `lessons` e em toda tabela da lista, com `free_for_all` respeitado.

### 1.3 Proteger o vídeo (não depender do segredo da URL)

- Hoje `content_url` é embed cru do Loom: sem token, sem expiração, sem trava de domínio. URL vazada toca pra sempre em qualquer lugar.
- Plano: migrar vídeo de aula pro **Bunny Stream** com token de segurança assinado, trava de referrer no domínio do Club e, se valer, MediaCage. URL vazada passa a ser inútil fora do site.
- Enquanto não migra: no mínimo garantir que `content_url` do Loom nunca chegue a quem não tem acesso à aula (resolvido por 1.2 + 1.1).

---

## Fase 2 — Revisão de código (automatizada + subagente)

**2.a `/security-review` no repo inteiro:**
```
cd ~/Desktop/VPS/club-site
git status          # árvore limpa antes
/security-review
```
Triar os achados por severidade real e jogar os confirmados na fila de conserto. Rede pra pegar injection em rota, segredo hardcoded, authz de endpoint.

**2.b Subagente revisor (`superpowers:requesting-code-review`)** sobre os consertos das Fases 1, 3 e 4. A cada lote de conserto commitado:
```
BASE_SHA=$(git rev-parse HEAD~1)   # antes do conserto
HEAD_SHA=$(git rev-parse HEAD)
```
Despachar um `general-purpose` com o template `code-reviewer.md`, com foco declarado em: RLS escopada a `purchases`, o select da aula sem `content_url`/`content_body`, falha-fechado nos endpoints de token, service key nunca no cliente. Consertar Critical na hora, Important antes de deployar, anotar Minor. Rebater com argumento técnico se o revisor errar.

---

## Fase 3 — auditoria-seguranca (6 clássicos + 2 perguntas de ouro), adaptada ao Club

### Os 6 clássicos

1. **Rate limit.** Endpoints que validam segredo: login OTP (`/members/login`), validação de token MCP (`/api/mcp/[transport]`), `/api/ceq/validate`. Disparar 6 tentativas erradas e ver se muda de comportamento. O Supabase Auth tem freio próprio no OTP: confirmar que está ligado e cobrir os endpoints próprios (MCP, CEQ).
2. **CORS.** `curl -sI -H "Origin: https://evil.com" .../api/mcp/...` e `/api/ceq/validate`. Esperado: sem cabeçalho de CORS permissivo (API serve à mesma origem).
3. **API devolvendo dados demais.** Ler o corpo inteiro de cada rota `/api/*` sem sessão e com sessão de usuário grátis. Conferir se `get_catalog_with_access` e `get_lesson` não vazam campo sensível de curso não comprado. Nenhum endpoint público pode contar dono, e-mail, telefone, quantidade de usuários.
4. **Sessão e logout.** O token do Supabase fica em cookie **acessível via JS** (padrão da lib, não é `httponly`): documentar o risco (XSS rouba sessão) e mitigar com CSP forte (Fase 4). Testar logout de verdade: logar, salvar cookie, deslogar, repetir chamadas com o cookie velho, tem que dar 401/redirect.
5. **Enumeração de usuário.** O signup OTP usa `shouldCreateUser: true` (cadastro aberto, de propósito, é o lead magnet). Confirmar que a resposta não diferencia "e-mail já existe" de "e-mail novo" de um jeito que entregue a base.
6. **SQL injection.** Ler o corpo dos RPCs (`get_lesson`, `get_catalog_with_access`, `is_club_active`, `match_lesson_chunks_published`) procurando concatenação de string em SQL. `ORDER BY` e nome de coluna dinâmicos têm que sair de lista fechada. Grep no código: `grep -rnE "execute\(|\.sql|rpc\(" app lib`.

### As 2 perguntas de ouro

1. **"Pego a URL de um usuário logado e abro no meu navegador, vejo os dados dele?"** Testar IDOR: rota de aula, `/api/ceq/validate`, conector MCP com token de outro membro, recursos com id na URL. Rodar cada rota sem cookie e com o cookie de OUTRO usuário.
2. **"Faço login, faço logout e volto na URL. Entro?"** Já coberto no clássico 4, confirmar na prática.

### Lições do CEQ (o que a lista não cobre e mordeu de verdade)

- **Verificação condicional é verificação ausente.** No `/api/mcp` e `/api/ceq/validate`, conferir que a validação de token **falha fechado**: sem segredo/token, nega, nunca libera. Procurar `if (SECRET)` que vira "sem secret, passa qualquer um".
- **Service key nunca no cliente.** `grep -rn "supabase/service\|SUPABASE_KEY\|service_role" app components` e garantir que `lib/supabase/service.ts` só é importado por route handler ou server action, jamais por componente de cliente (`'use client'`).
- **Segredo no histórico do git.** `git log --all -p | grep -E "service_role|sk_live|sk_test|eyJ.*role.*service|-----BEGIN"` antes de qualquer abertura de repo.
- **Erro engolido sem rollback / health que mente.** Menos crítico aqui (Supabase gerencia o banco), mas se houver escrita transacional própria, checar `except` sem tratamento e health check que só lê.

---

## Fase 4 — Headers, infra e monitoramento

- **Security headers** no `next.config.mjs` (hoje com 238 bytes, provavelmente sem `headers()`): CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy. É o que mitiga o risco do cookie de sessão acessível via JS (clássico 4). Espelhar o pacote que a Elite da IA usa.
- **Cloudflare na frente** do domínio (DDoS, WAF, esconde origem), se ainda não estiver.
- **Sentry no front** dos painéis: hoje o Club provavelmente está cego pra erro de cliente. Ligar pra ter o "vigia" do lado do usuário (a Elite da IA usa).
- **Rotação de chave** se a Fase 1/3 achar qualquer segredo exposto (anon key não conta, é pública; service_role sim).

---

## Fase 5 — Documento de postura e fechamento

- Escrever `docs/SEGURANCA.md` no padrão do CEQ: o que está protegido, o risco de cada coisa que não está, e o que fazer se você opera uma instância.
- Registrar o resultado da auditoria no Brain (memória de projeto do Club).
- Se algum item ficar "não verificado", ele fica na tabela como não verificado, nunca vira "ok".

---

## Ordem de execução e prioridade

| Fase | O que | Por que agora | Esforço |
|---|---|---|---|
| 1.1 | Confirmar RLS + teste de dump | Decide se é incêndio ativo | 30 min |
| 1.2 | Tirar `content_url`/`content_body` do select do menu | Fecha o furo do portão | 30 min |
| 1.3 | Migrar vídeo pro Bunny (ou trava interina) | URL do Loom vazada é eterna | projeto à parte |
| 2.a | `/security-review` no repo | Rede automatizada | 20 min + triagem |
| 3 | 6 clássicos + 2 perguntas de ouro | Cobertura manual verificada | meio período |
| 2.b | Subagente revisor nos consertos | Pega regressão antes do deploy | por lote |
| 4 | Headers + Cloudflare + Sentry | Barato, mitiga XSS | 1-2h |
| 5 | `docs/SEGURANCA.md` + Brain | Postura documentada | 1h |

## Formato do resultado (quando rodar)

Tabela: **item | como verifiquei | veredito** (`ok`/`furado`/`não se aplica`/`não verificado`). Depois os furados em ordem de risco real, cada um com o que acontece na prática se explorarem, e o conserto em uma frase.
