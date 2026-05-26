export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  onboarding: '/onboarding',
  overview: '/overview',
  suscripciones: '/suscripciones',
  asientos: '/asientos',
  comunidad: '/comunidad',
  billetera: '/billetera',
  settings: '/settings',
  settingsGroup: '/settings/grupo',
  overdue: '/billetera?status=overdue',
} as const

export const PUBLIC_ROUTES = [ROUTES.home, ROUTES.login, ROUTES.register] as const

export const PROTECTED_ROUTES = [
  ROUTES.onboarding,
  ROUTES.overview,
  ROUTES.suscripciones,
  ROUTES.asientos,
  ROUTES.comunidad,
  ROUTES.billetera,
  ROUTES.settings,
] as const