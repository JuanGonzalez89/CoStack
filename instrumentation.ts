declare global {
  // eslint-disable-next-line no-var
  var __costackInstrumentationInstalled: boolean | undefined
}

export async function register() {
  if (globalThis.__costackInstrumentationInstalled) {
    return
  }

  globalThis.__costackInstrumentationInstalled = true

  if (typeof globalThis.addEventListener !== 'function') {
    return
  }

  globalThis.addEventListener('unhandledrejection', (event) => {
    console.error('[CoStack] Unhandled rejection', event.reason)
  })

  globalThis.addEventListener('error', (event) => {
    const error = event instanceof ErrorEvent ? event.error : undefined
    console.error('[CoStack] Uncaught exception', error ?? event)
  })
}