export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  overview: '/overview',
  suscripciones: '/suscripciones',
  asientos: '/asientos',
  billetera: '/billetera',
  settings: '/settings',
  settingsGroup: '/settings/grupo',
} as const

export const PUBLIC_ROUTES = [ROUTES.home, ROUTES.login, ROUTES.register] as const

export const PROTECTED_ROUTES = [
  ROUTES.overview,
  ROUTES.suscripciones,
  ROUTES.asientos,
  ROUTES.billetera,
  ROUTES.settings,
] as const