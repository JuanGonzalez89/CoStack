import { PlaywrightProvider } from '../lib/provisioner/playwright-provider'

async function main() {
  console.log('🚀 Iniciando prueba de Provisioner para Hugging Face...')
  const provider = new PlaywrightProvider()
  
  const members = [
    { email: 'juangonzales@gmail.com', userId: 'user-1' },
    { email: 'juanurro27@gmail.com', userId: 'user-2' },
    { email: 'calderonsantiago2019@gmail.com', userId: 'user-3' }
  ]

  const result = await provider.fulfill('test-lobby-123', 'huggingface', members)
  
  console.log('\n🏁 Resultado final:', result)
}

main().catch(console.error)
