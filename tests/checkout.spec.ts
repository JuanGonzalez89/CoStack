import { test, expect } from '@playwright/test';

test('Flujo de Checkout Directo B2C', async ({ page }) => {
  // 0. Login primero
  await page.goto('/login');
  await page.getByLabel('Email').fill('martin@costack.app');
  await page.getByLabel('Contraseña').fill('password123');
  await page.getByRole('button', { name: 'Entrar' }).click();
  
  // Esperar a que el login termine y estemos en una página autenticada
  await page.waitForURL('**/suscripciones');
  
  // 2. Verificar que el título es correcto (ya que nos redirige aquí)
  
  // 2. Verificar que el título es correcto
  await expect(page.getByRole('heading', { name: 'Catálogo de Herramientas' })).toBeVisible();

  // 3. Buscar y hacer clic en el botón de comprar de la primera herramienta disponible (que no esté agotada)
  const comprarButton = page.getByRole('button', { name: 'Comprar acceso ahora' }).first();
  await expect(comprarButton).toBeVisible();
  await comprarButton.click();

  // 4. Debería redirigir al checkout
  await expect(page).toHaveURL(/.*\/checkout\/.*/);

  // 5. Verificar UI del Checkout (Sentido de urgencia)
  await expect(page.getByRole('heading', { name: 'Finalizar Compra' })).toBeVisible();
  await expect(page.getByText('Cupo Reservado')).toBeVisible();
  await expect(page.getByText(/10:00|09:5\d/)).toBeVisible(); // El timer debería estar en ~9:59

  // 6. Verificar detalles y storytelling
  await expect(page.getByText('Acceso Compartido, Trabajo Privado')).toBeVisible();
  await expect(page.getByText('Garantía de Uso 24/7')).toBeVisible();
  
  // 7. Simular pago
  const pagarButton = page.getByRole('button', { name: /Confirmar Pago/ });
  await expect(pagarButton).toBeVisible();
  await pagarButton.click();

  // 8. Verificar estado de carga
  await expect(page.getByText('Procesando Pago...')).toBeVisible();

  // 9. Verificar redirección al dashboard (overview o billetera)
  // El mock tiene un timeout de 2s, y luego 1.5s de redirección
  await expect(page).toHaveURL(/.*\/overview/, { timeout: 10000 });
});
