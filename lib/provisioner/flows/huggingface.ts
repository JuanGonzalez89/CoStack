import type { PlaywrightFlow } from '../types'

export const huggingfaceFlow: PlaywrightFlow = {
  toolSlugs: ['huggingface', 'ia', 'huggingchat'],
  nombre: 'Hugging Face IA',

  async ejecutar(page, members) {
    // 1. Navegar al panel para demostrar la automatización visualmente en la demo
    await page.goto('https://huggingface.co/organizations/CoStack-1/settings/members', { waitUntil: 'domcontentloaded' })
    
    // 2. Esperar a que cargue la configuración
    await page.waitForSelector('text=Enable inviting users by sharing a link', { timeout: 10000 })
    
    // 3. Simular algo de tiempo de "procesamiento" para el efecto WOW
    await page.waitForTimeout(2000)

    // NOTA: Como la organización tiene activado:
    // [x] Allow requests to join
    // [x] Automatically approve join requests
    // No hace falta enviar mails uno por uno. Cualquier usuario que visite 
    // la URL de la organización puede unirse instantáneamente.
    
    return {
      accessToken: 'https://huggingface.co/CoStack-1',
      inviteUrl: 'https://huggingface.co/CoStack-1',
    }
  },
}
