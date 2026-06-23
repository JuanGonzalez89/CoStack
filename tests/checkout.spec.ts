import { test, expect } from '@playwright/test';

async function loginAndSkipWelcome(page: any, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Contraseña').fill(password);
  await page.getByRole('button', { name: 'Entrar' }).click();

  await page.waitForLoadState('networkidle');

  if (page.url().includes('/welcome')) {
    const volverBtn = page.getByText('Volver al dashboard');
    if (await volverBtn.isVisible()) {
      await volverBtn.click();
      await page.waitForLoadState('networkidle');
    }
  }
}

test('Flujo de Checkout Directo B2C', async ({ page }) => {
  await loginAndSkipWelcome(page, 'martin@costack.app', 'password123');

  // Ir a suscripciones
  await page.goto('/suscripciones');
  await page.waitForLoadState('networkidle');

  // 1. Verificar que estamos en el catálogo
  await expect(page.getByRole('heading', { name: /Catálogo/ })).toBeVisible();

  // 2. Click en "Configurar Grupo y Añadir" de la primera tarjeta
  const configurarBtn = page.getByRole('button', { name: 'Configurar Grupo y Añadir' }).first();
  await expect(configurarBtn).toBeVisible();
  await configurarBtn.click();

  // 3. En el modal, click en "Configurar y pagar"
  await expect(page.getByText('Configurar y pagar').first()).toBeVisible({ timeout: 5000 });
  await page.getByText('Configurar y pagar').first().click();

  // 4. Debería redirigir al checkout
  await expect(page).toHaveURL(/.*\/checkout\/.*/);

  // 5. Verificar UI del Checkout
  await expect(page.getByText('Cupo Reservado')).toBeVisible();
  await expect(page.getByRole('button', { name: /Pagar/ })).toBeVisible();
});
