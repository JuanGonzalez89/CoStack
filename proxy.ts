import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(_request: NextRequest) {
  const response = NextResponse.next()

  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "img-src 'self' data: blob: https://prod.spline.design https://http2.mlstatic.com https://www.mercadolibre.com https://www.mercadolivre.com",
      "media-src 'self' data: blob: https://prod.spline.design",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vitals.vercel-insights.com https://unpkg.com https://sdk.mercadopago.com https://http2.mlstatic.com",
      "style-src 'self' 'unsafe-inline'",
      "connect-src 'self' https://prod.spline.design https://unpkg.com https://api.mercadopago.com https://*.mercadopago.com https://*.mercadolibre.com https://http2.mlstatic.com",
      "frame-src 'self' https://www.mercadopago.com https://www.mercadolibre.com https://www.mercadolivre.com https://http2.mlstatic.com",
    ].join("; ")
  )

  return response
}

export const config = {
  matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
}
