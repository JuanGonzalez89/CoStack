import type { MetadataRoute } from 'next'
import { ROUTES } from '@/lib/constants/routes'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://costack.app'

const routes = [
  ROUTES.home,
  ROUTES.login,
  ROUTES.register,
  ROUTES.onboarding,
  ROUTES.overview,
  ROUTES.suscripciones,
  ROUTES.asientos,
  ROUTES.comunidad,
  ROUTES.billetera,
  ROUTES.settings,
  ROUTES.settingsGroup,
]

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: new URL(route, siteUrl).toString(),
    lastModified: new Date(),
  }))
}