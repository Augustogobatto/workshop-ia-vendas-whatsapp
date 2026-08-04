-- CONSERTO DO VAZAMENTO DE CONTEUDO PAGO (Fase 1.2, parte de banco)
-- Contexto: em 2026-08-04 um usuario GRATIS (0 compras) leu content_url/content_body
-- de 23 aulas de cursos pagos (Workshop IA de Vendas, Oficina Claude Code) batendo
-- direto em GET /rest/v1/lessons?select=content_url. A policy de SELECT da tabela
-- lessons libera qualquer 'authenticated' a ler toda aula publicada.
--
-- Rodar no SQL editor do Supabase do Club (projeto edbhhijnpwgmksxnjzrr).

-- =====================================================================
-- PASSO 0 (diagnostico) — rodar e conferir o que existe hoje
-- =====================================================================
select policyname, cmd, roles, qual
from pg_policies
where schemaname = 'public' and tablename = 'lessons';

-- Confirmar que a RPC de acesso roda como SECURITY DEFINER (dona do objeto),
-- senao a Opcao A abaixo quebra a RPC tambem:
select p.proname, p.prosecdef as security_definer
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname in ('get_lesson', 'get_catalog_with_access');


-- =====================================================================
-- OPCAO A (RECOMENDADA E JA VALIDADA) — privilegio por coluna
-- Mantem o catalogo/curriculo visivel (nome das aulas continua aparecendo
-- pra atrair compra), mas TIRA content_url e content_body do alcance de
-- qualquer leitura direta na API. A aula so entrega o video pela RPC
-- get_lesson, que checa acesso. Requer get_lesson = SECURITY DEFINER (passo 0
-- confirmou: True).
--
-- ATENCAO 1 — nao basta "revoke select (coluna)": existe um GRANT SELECT no
-- nivel da TABELA que ofusca o revoke de coluna. Tem que TIRAR o select da
-- tabela e RECONCEDER so nas colunas permitidas:
begin;
revoke select on public.lessons from anon, authenticated;
grant select (id, module_id, name, slug, description, content_type,
              duration_seconds, sort_order, is_published, is_free,
              settings, created_at, updated_at)
  on public.lessons to anon, authenticated;
commit;
-- (service_role e postgres mantem select em tudo; a RPC definer tambem)
--
-- ATENCAO 2 — ORDEM DE APLICACAO (senao quebra a producao):
-- O frontend ANTIGO pede content_url no select do menu lateral. Se aplicar
-- este SQL antes de deployar o frontend corrigido, a pagina de aula QUEBRA
-- pra todo aluno logado (permission denied for column content_url).
-- Sequencia certa:
--   1) deployar o club-site com o select do menu SEM content_url/content_body
--      (ja corrigido em [lesson-slug]/page.tsx)
--   2) so entao rodar este bloco
--   3) revalidar com o teste do usuario gratis


-- =====================================================================
-- OPCAO B (alternativa) — RLS escopada a acesso
-- Esconde a LINHA inteira da aula de quem nao tem acesso ao produto.
-- Efeito colateral: a capa de um curso NAO comprado deixa de listar as aulas
-- (perde o curriculo-isca). So usar se nao quiser mostrar curriculo de curso
-- bloqueado. Troque <NOME_ATUAL> pelo policyname de SELECT do passo 0.
-- =====================================================================
-- drop policy if exists "<NOME_ATUAL>" on public.lessons;
--
-- create policy "lessons_select_com_acesso"
-- on public.lessons for select
-- to authenticated
-- using (
--   is_published = true
--   and (
--     is_free = true
--     or exists (
--       select 1 from public.modules m
--       join public.products p on p.id = m.product_id
--       where m.id = lessons.module_id
--         and (
--           coalesce((p.settings->>'free_for_all')::boolean, false) = true
--           or exists (
--             select 1 from public.purchases pu
--             join public.leads l on l.id = pu.lead_id
--             where pu.product_id = p.id
--               and pu.status = 'active'
--               and l.auth_user_id = auth.uid()
--           )
--         )
--     )
--   )
-- );


-- =====================================================================
-- PASSO DE VERIFICACAO (depois de aplicar A ou B)
-- Refazer o teste do usuario gratis: criar conta OTP nova e
--   GET /rest/v1/lessons?select=content_url,content_body
-- Esperado: content_url/content_body vem NULL ou a chamada e barrada;
-- get_lesson continua entregando o video pra quem tem acesso.
-- =====================================================================
