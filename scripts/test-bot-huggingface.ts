import { PlaywrightProvider } from "../lib/provisioner/playwright-provider"

async function test() {
  console.log("Iniciando prueba rápida del Bot de Hugging Face...")
  const provider = new PlaywrightProvider()
  
  try {
    const result = await provider.fulfill("lobby-prueba-123", "huggingface", [
      { email: "calderonsantiago2019@gmail.com", userId: "test-user-id" }
    ])
    
    console.log("Resultado del Bot de Hugging Face:", result)
    if (result.status === 'success') {
      console.log("Prueba exitosa. URL generada:", result.accessToken)
    }
  } catch (error) {
    console.error("Error al ejecutar Hugging Face:", error)
  }
}

test()
