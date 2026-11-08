import { expect, test } from '@playwright/test';

test.describe('Learn and guided experiment', () => {
  test('TEST-E2E-005 basics slides teach each gate with picture, table and quick check', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'What is a logic gate?' })).toBeVisible();
    await page.getByTestId('slide-next').click();
    await expect(page.getByTestId('slide-count')).toHaveText('2 / 11');

    await page.getByTestId('chip-gate-xor').click();
    const xorOutputs = page.getByTestId('gate-table-xor').locator('tbody td.output-col');
    await expect(xorOutputs).toHaveText(['0', '1', '1', '0']);
    await page.getByTestId('slide-input-input-a').click();
    await expect(page.getByTestId('slide-output')).toContainText('ON');
    await expect(page.locator('tr.current-row')).toHaveText('101');

    await page.getByTestId('check-0').click();
    await expect(page.getByTestId('quick-check')).toContainText('Correct!');
    await page.getByRole('button', { name: 'Show me in the picture' }).click();
    await expect(page.locator('tr.current-row')).toHaveText('110');
    await expect(page.getByTestId('slide-output')).toContainText('OFF');
  });

  test('TEST-E2E-006 student completes the AND bank-locker experiment', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('chip-gate-and').click();
    await page.getByRole('button', { name: 'Start guided experiment' }).click();
    const next = page.getByTestId('next-step');
    const impact = page.getByTestId('impact-panel');
    const locker = page.getByTestId('experiment-scene').getByTestId('locker');

    await expect(page.getByTestId('step-title')).toHaveText('Meet the circuit');
    await expect(impact).toContainText('This is the starting state.');
    await next.click();

    await expect(next).toBeDisabled();
    await expect(impact).toContainText("Set Manager's key to TURNED (1)");
    await page.getByTestId('exp-input-manager-key').click();
    await expect(page.getByTestId('impact-output')).toContainText('CLOSED (0)');
    await expect(impact).toContainText('No change in the output.');
    await expect(locker).toHaveAttribute('data-state', 'closed');
    await expect(locker.locator('[data-turned="true"]')).toHaveCount(1);
    await next.click();

    await page.getByTestId('exp-input-manager-key').click();
    await page.getByTestId('exp-input-customer-key').click();
    await expect(page.getByTestId('impact-output')).toContainText('CLOSED (0)');
    await next.click();

    await expect(page.getByTestId('exp-input-manager-key')).toBeDisabled();
    await page.getByTestId('guess-1').click();
    await page.getByRole('button', { name: 'Do it for me' }).click();
    await expect(page.getByTestId('impact-output')).toContainText('OPEN (1)');
    await expect(impact).toContainText('Changed from CLOSED (0).');
    await expect(page.getByTestId('prediction-result')).toContainText('correct ✓');
    await expect(locker).toHaveAttribute('data-state', 'open');
    await expect(locker.locator('[data-turned="true"]')).toHaveCount(2);
    await next.click();

    await expect(page.getByTestId('observations').locator('tbody tr')).toHaveCount(4);
    await expect(page.getByTestId('full-truth-table').locator('tbody tr')).toHaveCount(4);
    await next.click();
    await expect(page.getByTestId('summary')).toContainText('Experiment complete');
  });

  test('TEST-E2E-007 gate slides open the matching experiment and the free lab', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByTestId('chip-gate-or').click();
    await page.getByRole('button', { name: 'Start guided experiment' }).click();
    await expect(page.getByTestId('experiment-select')).toHaveValue('or-doorbell');

    await page.getByTestId('tab-basics').click();
    await page.getByTestId('chip-gate-nand').click();
    await page.getByRole('button', { name: 'Try it in Free lab' }).click();
    await expect(page.getByTestId('status')).toContainText('evaluated in the worker');
    await expect(page.getByTestId('output-output-y')).toHaveText('1');
  });
});
