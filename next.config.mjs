

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
  // 14/08/2026: a página nova assumiu a /club; a /club-v7 (link de preview que
  // já circulou) passa a apontar pra ela.
  async redirects() {
    return [
      { source: '/club-v7', destination: '/club', permanent: false },
    ]
  },
}

export default nextConfig
