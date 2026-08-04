

const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  images: {
    remotePatterns: [
      { hostname: 'edbhhijnpwgmksxnjzrr.supabase.co' },
    ],
  },
  // /club precisa ser redirect HTTP de verdade: o redirect() dentro de
  // app/club/page.tsx vira navegação client-side, e o <script> inline de
  // reveal das páginas club-v* não executa nesse caminho (React não roda
  // script inserido no client) — a página fica preta abaixo do hero.
  async redirects() {
    return [
      { source: '/club', destination: '/club-v2', permanent: false },
    ]
  },
}

export default nextConfig
