

const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  images: {
    remotePatterns: [
      { hostname: 'edbhhijnpwgmksxnjzrr.supabase.co' },
    ],
  },
  // Redirect HTTP de verdade, nunca redirect() dentro de page.tsx: o redirect()
  // vira navegação client-side, e o <script> inline de reveal das páginas club-v*
  // não executa nesse caminho (React não roda script inserido no client) — a
  // página fica preta abaixo do hero.
  // 14/08/2026: a página nova assumiu a /club. TODAS as versões antigas
  // (v1..v7) apontam pra ela — link velho em anúncio, DM ou bio não pode mais
  // cair numa página aposentada com preço furado. 307 (temporário) de
  // propósito: se um dia precisar reviver uma versão, o navegador não guardou
  // o redirect. A query string passa junto (o sck do rastreio sobrevive).
  // Lista explícita, não regex: uma /club-v8 de preview no futuro não pode
  // nascer já redirecionada.
  async redirects() {
    return ['/club-v1', '/club-v2', '/club-v3', '/club-v4', '/club-v5', '/club-v6', '/club-v7'].map(
      (source) => ({ source, destination: '/club', permanent: false })
    )
  },
}

export default nextConfig
