

const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  images: {
    remotePatterns: [
      { hostname: 'edbhhijnpwgmksxnjzrr.supabase.co' },
    ],
  },
}

export default nextConfig
