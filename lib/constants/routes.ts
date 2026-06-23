export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  onboarding: '/onboarding',
  welcome: '/welcome',
  overview: '/overview',
  suscripciones: '/suscripciones',
  asientos: '/asientos',
  comunidad: '/comunidad',
  billetera: '/billetera',
  ayuda: '/ayuda',
  settings: '/settings',
  settingsGroup: '/settings/grupo',
  overdue: '/billetera?status=overdue',
  success: '/suscripciones/success',
} as const

export const PUBLIC_ROUTES = [ROUTES.home, ROUTES.login, ROUTES.register] as const

export const PROTECTED_ROUTES = [
  ROUTES.onboarding,
  ROUTES.welcome,
  ROUTES.overview,
  ROUTES.suscripciones,
  ROUTES.asientos,
  ROUTES.comunidad,
  ROUTES.billetera,
  ROUTES.ayuda,
  ROUTES.settings,
  ROUTES.success,
] as const