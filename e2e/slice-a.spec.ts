import { expect, test } from '@playwright/test';

test.describe('R0 vertical slice A', () => {
  test('TEST-E2E-001 AND example runs in the worker with no network calls', async ({ page }) => {
    const external: string[] = [];
    page.on('request', (request) => {
      if (!request.url().startsWith('http://localhost:4173')) external.push(request.url());
    });
    await page.goto('/');
    await page.getByTestId('tab-lab').click();
    await expect(page.getByTestId('status')).toContainText('evaluated in the worker');
    await expect(page.getByTestId('output-output-y')).toHaveText('0');

    await page.getByTestId('input-input-a').click();
    await expect(page.getByTestId('output-output-y')).toHaveText('0');
    await page.getByTestId('input-input-b').click();
    await expect(page.getByTestId('output-output-y')).toHaveText('1');
    await expect(page.getByTestId('input-input-b')).toHaveAttribute('aria-pressed', 'true');

    const rows = page.getByTestId('truth-table').locator('tbody tr');
    await expect(rows).toHaveCount(4);
    await expect(rows.nth(3)).toHaveText('111');
    expect(external).toEqual([]);
  });

  test('TEST-E2E-002 switching to the full adder gives 8 truth-table rows', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('tab-lab').click();
    await page.getByTestId('starter-select').selectOption('full-adder');
    await expect(page.getByTestId('truth-table').locator('tbody tr')).toHaveCount(8);
    await page.getByTestId('input-input-a').click();
    await page.getByTestId('input-input-cin').click();
    await expect(page.getByTestId('output-sum-out')).toHaveText('0');
    await expect(page.getByTestId('output-cout-out')).toHaveText('1');
  });

  test('TEST-E2E-003 a bad import is refused and the open circuit is unchanged', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByTestId('tab-lab').click();
    await page.getByTestId('starter-select').selectOption('half-adder');
    await page.getByTestId('import-input').setInputFiles({
      name: 'bad.logiclab.json',
      mimeType: 'application/json',
      buffer: Buffer.from('{"schemaVersion":"9.0"}'),
    });
    await expect(page.getByTestId('diagnostics')).toContainText('DOCUMENT_SCHEMA_UNSUPPORTED');
    await expect(page.getByTestId('output-sum-out')).toBeVisible();
  });

  test('TEST-E2E-004 export then import keeps the circuit working', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('tab-lab').click();
    await page.getByTestId('starter-select').selectOption('half-adder');
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export' }).click();
    const file = await download;
    expect(file.suggestedFilename()).toBe('half-adder.logiclab.json');
    await page.getByTestId('starter-select').selectOption('and');
    await page.getByTestId('import-input').setInputFiles((await file.path()) ?? '');
    await expect(page.getByTestId('starter-select')).toHaveValue('');
    await page.getByTestId('input-input-a').click();
    await expect(page.getByTestId('output-sum-out')).toHaveText('1');
    await expect(page.getByTestId('diagnostics-empty')).toBeVisible();
  });
});
