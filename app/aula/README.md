# /aula — VSL de tráfego do Push Club

Porta do funil "Protocolo Viral" (Abraham / ABRAhub), dissecado em 06/09/2026.
Dossiê: `~/Downloads/club/dossies/2026-09-06-funil-abraham-protocolo-viral/`
(o `bruto/pagina/aula.html` é a especificação: 2370 linhas comentadas pelo autor).

## Como funciona

O vídeo é a página. As dobras (prova, mecanismo, oferta, garantia, FAQ) existem
no HTML servido, mas ficam escondidas por CSS até o visitante **cruzar o pitch
com o som ligado**. Quem não ouve o preço não vê botão.

- `AulaPlayer.tsx` — o motor: sorteio de variante, som, HLS, gate, retomada, telemetria.
- `Dobras.tsx` — tudo que só aparece depois do pitch. O `Rodape` fica FORA da trava.
- `vsl-config.json` — as variantes de VSL e a moldura (headline, overlay, thumb).
- `/api/vsl/evento` → tabela `vsl_eventos` + view `vsl_funil` no Supabase do Club.
- `pixel.ts` — espelho no Pixel da Meta (`2685766708197733`): tocou_som → ViewContent,
  pitch → Pitch, abriu_oferta → AbriuOferta, clicou_cta → **InitiateCheckout** (o evento
  que a campanha otimiza), compra → **Purchase** (na `/obrigado`). A BASE do pixel vem do
  `components/PixelGate.tsx` no layout global — **não carregar `fbevents.js` aqui**,
  dobraria o PageView.
- `../../lib/rastreio.ts` — o rastreio de compra (abaixo), compartilhado com a `/club`.
- `obrigado/` — destino do Stripe depois da compra: dispara o Purchase deduplicado.

## Rastreio de compra

**O contrato:** `visitante_id` (`v_` + 20 chars, localStorage `club_visitante`, sem
expirar) → `client_reference_id` em toda âncora do Stripe → o webhook na VPS recebe a
compra com esse id → lê `rastreio_visitantes` no Supabase do Club (sck, UTMs, fbclid,
`_fbp`/`_fbc`, IP, user-agent) → manda o Purchase pra CAPI com `event_id = session_id`.
A `/aula/obrigado` dispara o mesmo Purchase no pixel com o mesmo `eventID`, e a Meta
conta um só.

**Por quê:** o Payment Link do Stripe só aceita `[A-Za-z0-9_-]` no `client_reference_id`
e descarta o resto **em silêncio**. O `sck` usa `|` como separador — 0 de 62 compras
chegaram com referência (conferido no Stripe em 08/09/2026). O `sck` continua sendo
calculado e salvo em `club_primeiro_toque` (mesmo formato: outros lugares leem); ele só
não vai mais no link. A página manda a atribuição pro `/api/rastreio` (upsert: só a
coluna que veio no corpo sobrescreve, `primeiro_toque` só no insert).

**Pra fechar o circuito:** o Payment Link precisa redirecionar pra
`https://ia.augustogobatto.com/aula/obrigado?session_id={CHECKOUT_SESSION_ID}`, e
`CAPI_BASE` em `lib/capi.ts` tem que sair do placeholder quando o serviço da VPS subir.

## Quando a VSL fechar (é isso e mais nada)

1. Sobe o arquivo final no Bunny e pega as URLs de `.m3u8` e de `.mp4`.
2. Em `vsl-config.json`, na variante:
   - `mp4` e `hls` = as URLs do Bunny
   - `duration_s` = duração real em segundos
   - `pitch_s` = **o segundo exato em que o preço é falado** (cronometrar no
     arquivo final, não estimar: errar pra mais deixa gente decidida sem botão,
     errar pra menos abre a página antes do argumento fechar)
   - `fase` = `"campea"`
3. `publicada: true` — sai o `noindex`.
4. Confere em `/aula?abrir=1` (escape hatch de QA, fica em produção de propósito).

## /aula-v2 — o braço com pré-checkout (Fase 2, 10/09/2026)

Rota separada, `noindex`, que reusa TUDO desta pasta: mesmo `vsl-config.json`,
mesmo vídeo, mesmo CSS, mesmas dobras. A `/aula` não muda — é o controle.

A única diferença: o clique no **mensal** abre o `PreCheckout.tsx` em vez de
ir pro Stripe. O anual continua link direto. Três passos:
WhatsApp (salvo no servidor assim que fica válido) → cartão ou Pix recorrente
→ (só Pix) nome, CPF e e-mail → QR de Pix Automático do Asaas.

- `PreCheckout.tsx` — o popup. Entra por `next/dynamic` a partir de
  `Dobras.tsx`: import estático poria o código dele também no bundle da
  `/aula`, e braço de controle mais pesado vira diferença de play rate.
- `telemetria.ts` — o transporte de evento que o player e o popup dividem.
- `../../lib/br.ts` — máscara de telefone (a da skill `rastreio-checkout`),
  CPF com dígito verificador, e-mail.
- `../../lib/membro.ts` — "já é membro?" antes do QR. Sem isso, um membro da
  Stripe que pagasse por Pix teria a linha de `purchases` reescrita.
- `/api/pre-checkout` e `/api/pre-checkout/pix` — o servidor. O token do
  `club-pagamentos` vive só na env da Vercel (`CLUB_PAGAMENTOS_TOKEN`).
- Backend: `/home/claude/club-pagamentos/README.md` na vps-claude.

**O que NÃO pode se perder aqui:**
- O link do Stripe do caminho do cartão sai do `href` do próprio `<a>`
  clicado, já carimbado. Remontar a URL mata o rastreio (regra 5 da skill).
- `pre_checkout.estado` só anda pra frente. Estado que retrocede desliga o
  reuso do QR no backend e cria uma segunda cobrança no Asaas.
- O popup não pode ter escassez. O relógio do QR é o prazo do banco.

Leitura do teste: `/aula/painel`, seção "Por página".

## Testar uma versão nova sem derrubar a campeã

Acrescenta uma variante ao array com `peso` menor (ex.: campeã 90, desafiante 10).
O sorteio é ponderado e **sticky por localStorage**: quem já está assistindo não
é reatribuído. `sync` é por versão — trocou o corte, a posição salva é descartada.
Forçar uma versão para conferir: `/aula?v=<versao_id>`.

## Regras que NÃO podem ser afrouxadas

- **Zero escassez** — sem contador, vaga, data ou "vai subir". Vale pra qualquer
  variante nova. A pressão fica no upsell pós-compra, nunca aqui.
- **Sem preço no primeiro CTA** (o do herói e a barra fixa do mobile).
- **Mudo não é assistir** — o gate exige `!muted`, e o unmute rebobina.
- **Nunca abrir por relógio** — só `video.error` + 60s sem andar.
- **O rodapé legal fica fora da trava** — disclaimer e CDC não podem depender
  do minuto do vídeo.
- **Mensagem de membro só entra com consentimento por escrito**
  (`PROVAS_DE_MEMBROS` em `Dobras.tsx`).
