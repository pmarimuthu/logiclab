import { expect, test } from '@playwright/test';

test('TEST-E2E-010 no console errors or blocked resources on any tab', async ({ page }) => {
  const problems: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') problems.push(message.text());
  });
  page.on('pageerror', (error) => problems.push(error.message));
  page.on('requestfailed', (request) => problems.push(`failed: ${request.url()}`));

  await page.goto('/');
  await page.getByTestId('chip-gate-and').click();
  await page.getByTestId('slide-input-input-a').click();
  await expect(page.getByTestId('slide-output')).toContainText('CLOSED');
  await page.getByTestId('tab-experiment').click();
  await expect(page.getByTestId('impact-panel')).toContainText('starting state');
  await page.getByTestId('tab-lab').click();
  await expect(page.getByTestId('status')).toContainText('evaluated in the worker');
  const favicon = await page.request.get('/favicon.svg');
  expect(favicon.ok()).toBe(true);
  expect(problems).toEqual([]);
});
