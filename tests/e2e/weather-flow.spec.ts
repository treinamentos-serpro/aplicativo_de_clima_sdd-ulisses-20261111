import { expect, test } from '@playwright/test';
import { SAO_PAULO_OPTION, searchAndSelectCity } from './support/cityFlow';
import { mockOpenMeteo } from './support/openMeteo';

test.describe('Fluxo de busca de clima', () => {
  test('mostra instrução inicial sem fazer requisições (AC-01.1)', async ({ page }) => {
    const api = await mockOpenMeteo(page);

    await page.goto('/');

    await expect(page.getByText('Busque uma cidade')).toBeVisible();
    expect(api.geocodingRequests()).toBe(0);
    expect(api.forecastRequests()).toBe(0);
  });

  test('busca lista cidades e só carrega o clima após a seleção (AC-01.2, AC-01.5)', async ({
    page,
  }) => {
    const api = await mockOpenMeteo(page);
    await page.goto('/');

    await page.getByRole('textbox', { name: 'Buscar cidade' }).fill('São Paulo');
    await page.getByRole('button', { name: 'Buscar' }).click();

    await expect(page.getByRole('heading', { name: 'Escolha a cidade' })).toBeVisible();
    expect(api.forecastRequests()).toBe(0);

    await page.getByRole('button', { name: SAO_PAULO_OPTION }).click();

    await expect(page.getByRole('region', { name: SAO_PAULO_OPTION })).toBeVisible();
    expect(api.forecastRequests()).toBeGreaterThan(0);
  });

  test('exibe clima atual e 5 dias de previsão após selecionar a cidade (AC-02.1, AC-03.1)', async ({
    page,
  }) => {
    await mockOpenMeteo(page);
    await page.goto('/');

    await searchAndSelectCity(page, 'São Paulo');

    const current = page.getByRole('region', { name: SAO_PAULO_OPTION });
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

    await searchAndSelectCity(page, 'São Paulo');
    await expect(page.getByRole('region', { name: 'Próximos dias' })).toBeVisible();

    const requestsBefore = api.forecastRequests();
    await page.getByRole('button', { name: '°F' }).click();

    await expect(page.getByRole('button', { name: '°F' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('region', { name: SAO_PAULO_OPTION })).toContainText('75');
    expect(api.forecastRequests()).toBe(requestsBefore);
  });

  test('mostra estado vazio quando a cidade não existe (AC-01.4)', async ({ page }) => {
    await mockOpenMeteo(page, { geocoding: { status: 200, body: {} } });
    await page.goto('/');

    await page.getByRole('textbox', { name: 'Buscar cidade' }).fill('Xyzzyville');
    await page.getByRole('button', { name: 'Buscar' }).click();

    await expect(page.getByText('Nenhuma cidade encontrada')).toBeVisible();
  });

  test('erro no clima atual não esconde a previsão e recupera ao tentar novamente (AC-09.1, AC-09.2, AC-RF03.1)', async ({
    page,
  }) => {
    await mockOpenMeteo(page);
    let failCurrentOnce = true;
    // Rota registrada depois tem prioridade: falha só a requisição do clima atual, uma vez.
    await page.route(/api\.open-meteo\.com/, (route) => {
      if (failCurrentOnce && route.request().url().includes('current=')) {
        failCurrentOnce = false;
        return route.fulfill({ status: 500, contentType: 'application/json', body: '{}' });
      }
      return route.fallback();
    });
    await page.goto('/');

    await searchAndSelectCity(page, 'São Paulo');

    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByRole('region', { name: 'Próximos dias' })).toBeVisible();

    await page.getByRole('button', { name: 'Tentar novamente' }).click();

    await expect(page.getByRole('region', { name: SAO_PAULO_OPTION })).toBeVisible();
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
    await page.getByRole('button', { name: SAO_PAULO_OPTION }).click();

    await expect(page.getByRole('region', { name: SAO_PAULO_OPTION })).toBeVisible();
    await expect(page.getByRole('alert')).toHaveCount(0);
  });

  test('navega e alterna unidade pelo teclado (AC-05.1, AC-05.3)', async ({ page }) => {
    await mockOpenMeteo(page);
    await page.goto('/');

    const input = page.getByRole('textbox', { name: 'Buscar cidade' });
    await input.focus();
    await page.keyboard.type('São Paulo');
    await page.keyboard.press('Enter');

    const option = page.getByRole('button', { name: SAO_PAULO_OPTION });
    await option.focus();
    await page.keyboard.press('Enter');

    await expect(page.getByRole('region', { name: 'Próximos dias' })).toBeVisible();

    const fahrenheit = page.getByRole('button', { name: '°F' });
    await fahrenheit.focus();
    await page.keyboard.press('Enter');

    await expect(fahrenheit).toHaveAttribute('aria-pressed', 'true');
  });
});
