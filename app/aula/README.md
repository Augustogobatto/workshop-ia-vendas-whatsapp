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
  que a campanha otimiza). A BASE do pixel vem do `components/PixelGate.tsx` no layout
  global — **não carregar `fbevents.js` aqui**, dobraria o PageView.

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
