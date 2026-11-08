import { expect, test, type Page } from '@playwright/test';

const SLIDES = [
  'intro-0',
  'intro-1',
  'intro-2',
  'intro-3',
  'gate-and',
  'gate-or',
  'gate-not',
  'gate-nand',
  'gate-nor',
  'gate-xor',
  'gate-xnor',
];

async function overflow(page: Page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const body = document.querySelector('.tab-body');
    const slide = document.querySelector('.slide-body');
    const left = document.querySelector('.exp-left');
    const extra = (element: Element | null) =>
      element === null ? 0 : Math.max(0, element.scrollHeight - element.clientHeight - 1);
    return {
      page: Math.max(0, root.scrollHeight - innerHeight),
      wide: Math.max(0, root.scrollWidth - innerWidth),
      tab: extra(body),
      inner: Math.max(extra(slide), extra(left)),
    };
  });
}

const fits = { page: 0, wide: 0, tab: 0, inner: 0 };

test.describe('TEST-E2E-008 every screen fits a laptop window without scrolling', () => {
  test.use({ viewport: { width: 1280, height: 680 } });

  test('all basics slides, all experiment steps and the free lab', async ({ page }) => {
    await page.goto('/');
    for (const slide of SLIDES) {
      await page.getByTestId(`chip-${slide}`).click();
      expect(await overflow(page), slide).toEqual(fits);
    }
    for (const id of ['and-locker', 'or-doorbell', 'xor-staircase']) {
      await page.getByTestId('tab-experiment').click();
      await page.getByTestId('experiment-select').selectOption(id);
      for (let step = 0; step < 5; step += 1) {
        const guess = page.getByTestId('guess-1');
        if (await guess.isVisible()) await guess.click();
        const helper = page.getByRole('button', { name: 'Do it for me' });
        if (await helper.isVisible()) await helper.click();
        await expect(page.getByTestId('next-step')).toBeEnabled();
        expect(await overflow(page), `${id} step ${step + 1}`).toEqual(fits);
        await page.getByTestId('next-step').click();
      }
      expect(await overflow(page), `${id} summary`).toEqual(fits);
    }
    await page.getByTestId('tab-lab').click();
    expect(await overflow(page), 'free lab').toEqual(fits);
  });
});

test.describe('TEST-E2E-009 mobile: no sideways scroll and the page itself never scrolls', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('every tab on a phone', async ({ page }) => {
    await page.goto('/');
    for (const slide of SLIDES) {
      await page.getByTestId(`chip-${slide}`).click();
      const result = await overflow(page);
      expect(result.wide, slide).toBe(0);
      expect(result.page, slide).toBe(0);
    }
    await page.getByTestId('tab-experiment').click();
    await expect(page.getByTestId('next-step')).toBeInViewport();
    const experiment = await overflow(page);
    expect([experiment.page, experiment.wide]).toEqual([0, 0]);
    await page.getByTestId('tab-lab').click();
    const lab = await overflow(page);
    expect([lab.page, lab.wide]).toEqual([0, 0]);
  });
});
