import { test, expect } from '@playwright/test';

test.describe('Dashboard B2C (Etapa 4)', () => {

  test('Vista de Miembro (B2C Storytelling)', async ({ page }) => {

    // 1. Iniciar sesión como miembro
    await page.goto('/login');
    await page.getByLabel('Email').fill('santiago@costack.app');
    await page.getByLabel('Contraseña').fill('password123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    
    // Esperar a redirigir
    await page.waitForURL('**/suscripciones');
    await page.goto('/overview');

    // 2. Verificar copys B2C
    const text = await page.locator('body').innerText();
    console.log("URL AFTER GOTO:", page.url());
    console.log("PAGE TEXT:", text);
    await expect(page.getByText('Tu Espacio')).toBeVisible(); // 3. Verificar que no se muestra información compleja de Manager
    await expect(page.getByText('Alerta de mora')).not.toBeVisible();
    await expect(page.getByText('Tráfico de pagos')).not.toBeVisible();
    await expect(page.getByText('Bot log reducido')).not.toBeVisible();

    // 4. Verificar Summary Cards B2C
    await expect(page.getByText('Tus Licencias')).toBeVisible();
    await expect(page.getByText('Ahorro Mensual')).toBeVisible();
    await expect(page.getByText('Próximo Vencimiento')).toBeVisible();

    // 5. Verificar SuccessAccessCard y descubrir credenciales
    await expect(page.getByRole('heading', { name: '¡Tu licencia está lista!' })).toBeVisible();
    const verBtn = page.getByRole('button', { name: 'Ver Credenciales de Acceso' });
    await expect(verBtn).toBeVisible();
    await verBtn.click();
    
    // Credencial mostrada
    await expect(page.getByText('Token de Acceso')).toBeVisible();
  });

  test('Vista de Organizador (Métricas Complejas)', async ({ page }) => {
    // 1. Iniciar sesión como organizador
    await page.goto('/login');
    await page.getByLabel('Email').fill('martin@costack.app');
    await page.getByLabel('Contraseña').fill('password123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    
    // Esperar a redirigir
    await page.waitForURL('**/suscripciones');
    await page.goto('/overview');

    // 2. Verificar copys Manager
    const text = await page.locator('body').innerText();
    console.log("MARTIN PAGE TEXT:", text);
    await expect(page.getByText('Control operativo')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'CoStack en tiempo real' })).toBeVisible();

    // 3. Verificar que SÍ se muestra información compleja de Manager
    await expect(page.getByText('Semáforo de Pagos')).toBeVisible();
    await expect(page.getByText('Bot log reducido')).toBeVisible();

    // 4. Verificar Summary Cards Manager
    await expect(page.getByText('Gasto acumulado')).toBeVisible();
    await expect(page.getByText('Pagos en mora')).toBeVisible();
  });
});
