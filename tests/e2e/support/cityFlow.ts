import type { Page } from '@playwright/test';

export const SAO_PAULO_OPTION = 'São Paulo, São Paulo, Brasil';

/** Busca uma cidade e escolhe o resultado na lista (AC-01.2, AC-01.5). */
export async function searchAndSelectCity(page: Page, name: string, option = SAO_PAULO_OPTION) {
  await page.getByRole('textbox', { name: 'Buscar cidade' }).fill(name);
  await page.getByRole('button', { name: 'Buscar' }).click();
  await page.getByRole('button', { name: option }).click();
}
