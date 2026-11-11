import { expect, test } from '@playwright/test';
import { SAO_PAULO_OPTION, searchAndSelectCity } from './support/cityFlow';
import { mockOpenMeteo } from './support/openMeteo';

const MIN_TOUCH_TARGET_PX = 44;

test.describe('Experiência mobile', () => {
  test.use({ viewport: { width: 320, height: 640 }, hasTouch: true });

  test('não tem rolagem horizontal em 320px (AC-08.1)', async ({ page }) => {
    await mockOpenMeteo(page);
    await page.goto('/');
    await searchAndSelectCity(page, 'São Paulo');
    await expect(page.getByRole('region', { name: 'Próximos dias' })).toBeVisible();

    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
  });

  test('alvos de toque têm pelo menos 44×44px (AC-08.2)', async ({ page }) => {
    await mockOpenMeteo(page);
    await page.goto('/');

    const targets = [
      page.getByRole('textbox', { name: 'Buscar cidade' }),
      page.getByRole('button', { name: 'Buscar' }),
      page.getByRole('button', { name: '°C' }),
      page.getByRole('button', { name: '°F' }),
    ];

    for (const target of targets) {
      const box = await target.boundingBox();
      expect(box).not.toBeNull();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX);
      expect(box?.width ?? 0).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX);
    }
  });

  test('fluxo completo com toque (AC-08.3)', async ({ page }) => {
    await mockOpenMeteo(page);
    await page.goto('/');

    await page.getByRole('textbox', { name: 'Buscar cidade' }).tap();
    await page.getByRole('textbox', { name: 'Buscar cidade' }).fill('São Paulo');
    await page.getByRole('button', { name: 'Buscar' }).tap();
    await page.getByRole('button', { name: SAO_PAULO_OPTION }).tap();

    await expect(page.getByRole('region', { name: SAO_PAULO_OPTION })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Próximos dias' }).getByRole('article')).toHaveCount(5);

    await page.getByRole('button', { name: '°F' }).tap();
    await expect(page.getByRole('button', { name: '°F' })).toHaveAttribute('aria-pressed', 'true');
  });

  test('nome de cidade muito longo não cria rolagem horizontal em 320px (EC-18)', async ({ page }) => {
    const longName = 'Itaguaí de Nossa Senhora da Conceição do Alto Rio Grande do Sul Interior Extremo';
    await mockOpenMeteo(page, {
      geocoding: {
        status: 200,
        body: {
          results: [
            {
              id: 1,
              name: longName,
              latitude: -23.5,
              longitude: -46.6,
              country: 'Brasil',
              admin1: 'São Paulo',
            },
          ],
        },
      },
    });
    await page.goto('/');
    await page.getByRole('textbox', { name: 'Buscar cidade' }).fill(longName);
    await page.getByRole('button', { name: 'Buscar' }).click();
    await page.getByRole('button', { name: `${longName}, São Paulo, Brasil` }).click();
    await expect(page.getByRole('region', { name: 'Próximos dias' })).toBeVisible();

    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
  });
});

test.describe('Fluxo mobile em 375×812', () => {
  test.use({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true });

  test('busca e mostra o clima corretamente', async ({ page }) => {
    await mockOpenMeteo(page);
    await page.goto('/');

    await page.getByRole('textbox', { name: 'Buscar cidade' }).fill('São Paulo');
    await page.getByRole('button', { name: 'Buscar' }).tap();
    await page.getByRole('button', { name: SAO_PAULO_OPTION }).tap();

    await expect(page.getByRole('region', { name: SAO_PAULO_OPTION })).toContainText('24°C');
    await expect(page.getByRole('region', { name: 'Próximos dias' }).getByRole('article')).toHaveCount(5);
  });
});


