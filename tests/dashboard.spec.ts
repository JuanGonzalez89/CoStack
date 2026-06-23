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

test.describe('Dashboard B2C (Etapa 4)', () => {

  test('Vista de Miembro (B2C Storytelling)', async ({ page }) => {
    await loginAndSkipWelcome(page, 'santiago@costack.app', 'password123');

    await page.goto('/overview');
    await page.waitForLoadState('networkidle');

    // Verificar que el miembro ve su sección de suscripciones
    await expect(page.getByText('TU SUSCRIPCIÓN')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Tus Herramientas' })).toBeVisible();
  });

  test('Vista de Organizador (Métricas Complejas)', async ({ page }) => {
    await loginAndSkipWelcome(page, 'martin@costack.app', 'password123');

    await page.goto('/overview');
    await page.waitForLoadState('networkidle');

    // Verificar que el organizador ve la vista de organizador
    await expect(page.getByText('VISTA DE ORGANIZADOR')).toBeVisible();
    await expect(page.getByText('CoStack Studio')).toBeVisible();
    await expect(page.getByRole('main').getByText('Sistema activo')).toBeVisible();
  });
});
