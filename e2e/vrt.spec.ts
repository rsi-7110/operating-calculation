import { test, expect } from '@playwright/test';

test.describe('VRT', () => {
  test('初期表示', async ({ page }) => {
    await page.goto('/operating-calculation');
    await expect(page).toHaveScreenshot();
  });

  test('計算結果（翌日扱い）', async ({ page }) => {
    await page.goto('/operating-calculation');
    await page.locator('#start').selectOption('22:00');
    await page.locator('#end').selectOption('06:00');
    await page.locator('#calc').click();
    await expect(page).toHaveScreenshot();
  });

  test('計算結果（休憩控除なし）', async ({ page }) => {
    await page.goto('/operating-calculation');
    await page.locator('#start').selectOption('13:00');
    await page.locator('#end').selectOption('18:00');
    await page.locator('#calc').click();
    await expect(page).toHaveScreenshot();
  });

  test('レスポンシブ表示', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/operating-calculation');
    await expect(page).toHaveScreenshot();
  });
});
