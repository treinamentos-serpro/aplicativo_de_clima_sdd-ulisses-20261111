import { expect, test } from '@playwright/test';
import { forecastBody, mockOpenMeteo } from './support/openMeteo';

test.describe('Fluxo de busca de clima', () => {
  test('mostra instrução inicial sem fazer requisições (AC-01.1)', async ({ page }) => {
    const api = await mockOpenMeteo(page);

    await page.goto('/');

    await expect(page.getByText('Busque uma cidade')).toBeVisible();
    expect(api.geocodingRequests()).toBe(0);
    expect(api.forecastRequests()).toBe(0);
  });

  test('busca uma cidade e exibe clima atual e 5 dias de previsão (AC-01.2, AC-01.5, AC-02.1, AC-03.1)', async ({
    page,
  }) => {
    await mockOpenMeteo(page);
    await page.goto('/');

    await page.getByRole('textbox', { name: 'Buscar cidade' }).fill('São Paulo');
    await page.getByRole('button', { name: 'Buscar' }).click();

    const current = page.getByRole('region', { name: 'São Paulo, São Paulo, Brasil' });
    await expect(current).toBeVisible();
    await expect(current).toContainText('24');
    await expect(current).toContainText('68');
    await expect(current).toContainText('12');

    const forecast = page.getByRole('region', { name: 'Próximos dias' });
    await expect(forecast.getByRole('article')).toHaveCount(5);
  });

  test('alterna para Fahrenheit sem nova requisição (AC-07.2, AC-07.3, AC-07.4)', async ({ page }) => {
    const api = await mockOpenMeteo(page);
    await page.goto('/');

    await page.getByRole('textbox', { name: 'Buscar cidade' }).fill('São Paulo');
    await page.getByRole('button', { name: 'Buscar' }).click();
    await expect(page.getByRole('region', { name: 'Próximos dias' })).toBeVisible();

    const requestsBefore = api.forecastRequests();
    await page.getByRole('button', { name: '°F' }).click();

    await expect(page.getByRole('button', { name: '°F' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('region', { name: 'São Paulo, São Paulo, Brasil' })).toContainText('75');
    expect(api.forecastRequests()).toBe(requestsBefore);
  });

  test('mostra estado vazio quando a cidade não existe (AC-01.4)', async ({ page }) => {
    await mockOpenMeteo(page, { geocoding: { status: 200, body: {} } });
    await page.goto('/');

    await page.getByRole('textbox', { name: 'Buscar cidade' }).fill('Xyzzyville');
    await page.getByRole('button', { name: 'Buscar' }).click();

    await expect(page.getByText('Nenhuma cidade encontrada')).toBeVisible();
  });

  test('exibe erro e recupera ao tentar novamente (AC-09.1, AC-09.2)', async ({ page }) => {
    await mockOpenMeteo(page, {
      forecast: (attempt) =>
        attempt === 1
          ? { status: 500, body: { error: true } }
          : { status: 200, body: forecastBody },
    });
    await page.goto('/');

    await page.getByRole('textbox', { name: 'Buscar cidade' }).fill('São Paulo');
    await page.getByRole('button', { name: 'Buscar' }).click();

    await expect(page.getByRole('alert')).toBeVisible();

    await page.getByRole('button', { name: 'Tentar novamente' }).click();

    await expect(page.getByRole('region', { name: 'São Paulo, São Paulo, Brasil' })).toBeVisible();
    await expect(page.getByRole('alert')).toHaveCount(0);
  });

  test('mostra erro offline e recupera ao reconectar (EC-10, AC-09.1, AC-09.2)', async ({ page }) => {
    await mockOpenMeteo(page);
    let offline = true;
    // Rotas registradas depois têm prioridade: simula queda de rede e, ao voltar, delega ao mock.
    await page.route(/open-meteo\.com/, (route) =>
      offline ? route.abort('internetdisconnected') : route.fallback(),
    );
    await page.goto('/');

    await page.getByRole('textbox', { name: 'Buscar cidade' }).fill('São Paulo');
    await page.getByRole('button', { name: 'Buscar' }).click();

    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByRole('region', { name: 'Próximos dias' })).toHaveCount(0);

    offline = false;
    await page.getByRole('button', { name: 'Tentar novamente' }).click();

    await expect(page.getByRole('region', { name: 'São Paulo, São Paulo, Brasil' })).toBeVisible();
    await expect(page.getByRole('alert')).toHaveCount(0);
  });

  test('navega e alterna unidade pelo teclado (AC-05.1, AC-05.3)', async ({ page }) => {
    await mockOpenMeteo(page);
    await page.goto('/');

    const input = page.getByRole('textbox', { name: 'Buscar cidade' });
    await input.focus();
    await page.keyboard.type('São Paulo');
    await page.keyboard.press('Enter');

    await expect(page.getByRole('region', { name: 'Próximos dias' })).toBeVisible();

    const fahrenheit = page.getByRole('button', { name: '°F' });
    await fahrenheit.focus();
    await page.keyboard.press('Enter');

    await expect(fahrenheit).toHaveAttribute('aria-pressed', 'true');
  });
});
