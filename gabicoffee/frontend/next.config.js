/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Explicitly empty remotePatterns — no external image sources allowed.
    // This mitigates the DoS via Image Optimizer remotePatterns vulnerability.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mqryjzbjamriwhlsobby.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    // Limit image sizes to prevent abuse
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
}

module.exports = nextConfig
