/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; img-src 'self' data: blob: https://prod.spline.design; media-src 'self' data: blob: https://prod.spline.design; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vitals.vercel-insights.com https://unpkg.com; style-src 'self' 'unsafe-inline'; connect-src 'self' https://prod.spline.design https://unpkg.com;",
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ]
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
