import { test, expect } from '@playwright/test';

test.describe('画面描画時', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/operating-calculation');
  });

  test('開始セレクトボックスに09:00が入力されていること', async ({ page }) => {
    await expect(page.locator('#start')).toHaveValue('09:00');
  });

  test('開始セレクトボックスが活性状態であること', async ({ page }) => {
    await expect(page.locator('#start')).toBeEnabled();
  });

  test('終了セレクトボックスに18:00が入力されていること', async ({ page }) => {
    await expect(page.locator('#end')).toHaveValue('18:00');
  });

  test('終了セレクトボックスが活性状態であること', async ({ page }) => {
    await expect(page.locator('#end')).toBeEnabled();
  });

  test('計算するボタンが表示されていること', async ({ page }) => {
    await expect(page.locator('#calc')).toBeVisible();
  });

  test('計算するボタンが活性状態であること', async ({ page }) => {
    await expect(page.locator('#calc')).toBeEnabled();
  });

  test('終了 現在時刻ボタンが表示されていること', async ({ page }) => {
    await expect(page.locator('#nowEnd')).toBeVisible();
  });

  test('終了 現在時刻ボタンが活性状態であること', async ({ page }) => {
    await expect(page.locator('#nowEnd')).toBeEnabled();
  });
});

test.describe('「計算する」ボタン押下時', () => {
  const cases = [
    // 同日シナリオ
    { start: '09:00', end: '12:00', mainValue: '3:00', breakMins: '0 分', rawWork: '180 分（3時間00分）' },
    { start: '09:00', end: '12:30', mainValue: '3:00', breakMins: '30 分', rawWork: '180 分（3時間00分）' },
    { start: '09:00', end: '13:00', mainValue: '3:00', breakMins: '60 分', rawWork: '180 分（3時間00分）' },
    { start: '09:00', end: '17:49', mainValue: '7:45', breakMins: '60 分', rawWork: '469 分（7時間49分）' },
    { start: '09:00', end: '17:50', mainValue: '8:00', breakMins: '60 分', rawWork: '470 分（7時間50分）' },
    { start: '09:00', end: '18:00', mainValue: '8:00', breakMins: '60 分', rawWork: '480 分（8時間00分）' },
    { start: '09:00', end: '18:30', mainValue: '8:00', breakMins: '90 分', rawWork: '480 分（8時間00分）' },
    { start: '09:00', end: '19:00', mainValue: '8:30', breakMins: '90 分', rawWork: '510 分（8時間30分）' },
    { start: '09:00', end: '22:00', mainValue: '11:00', breakMins: '120 分', rawWork: '660 分（11時間00分）' },
    { start: '09:00', end: '23:00', mainValue: '12:00', breakMins: '120 分', rawWork: '720 分（12時間00分）' },
    { start: '10:00', end: '18:00', mainValue: '7:00', breakMins: '60 分', rawWork: '420 分（7時間00分）' },
    { start: '10:00', end: '19:00', mainValue: '7:30', breakMins: '90 分', rawWork: '450 分（7時間30分）' },
    { start: '13:00', end: '18:00', mainValue: '5:00', breakMins: '0 分', rawWork: '300 分（5時間00分）' },
    // 翌日シナリオ
    { start: '22:00', end: '06:00', mainValue: '7:00', breakMins: '60 分', rawWork: '420 分（7時間00分）', nextDay: true },
    { start: '22:00', end: '08:00', mainValue: '9:00', breakMins: '60 分', rawWork: '540 分（9時間00分）', nextDay: true },
    { start: '23:00', end: '08:00', mainValue: '8:00', breakMins: '60 分', rawWork: '480 分（8時間00分）', nextDay: true },
  ];

  for (const c of cases) {
    test(`${c.start}〜${c.end} → ${c.mainValue}`, async ({ page }) => {
      await page.goto('/operating-calculation');
      await page.locator('#start').selectOption(c.start);
      await page.locator('#end').selectOption(c.end);
      await page.locator('#calc').click();

      await expect(page.locator('.mainValue')).toHaveText(c.mainValue);
      await expect(page.locator('.rowkv .v').first()).toHaveText(c.breakMins);
      await expect(page.locator('.rowkv .v').last()).toHaveText(c.rawWork);

      if (c.nextDay) {
        await expect(page.locator('.hint')).toContainText('翌日扱い');
      }
    });
  }
});

test.describe('「終了 現在時刻」ボタン押下時', () => {
  test('15:30に押下 → 終了が15:30になり計算結果が正しいこと', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2025-01-15T15:30:00'));
    await page.goto('/operating-calculation');
    await page.locator('#nowEnd').click();

    await expect(page.locator('#end')).toHaveValue('15:30');
    await expect(page.locator('.mainValue')).toHaveText('5:30');
    await expect(page.locator('.rowkv .v').first()).toHaveText('60 分');
    await expect(page.locator('.rowkv .v').last()).toHaveText('330 分（5時間30分）');
  });

  test('20:35に押下 → 終了が20:35になり計算結果が正しいこと', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2025-01-15T20:35:00'));
    await page.goto('/operating-calculation');
    await page.locator('#nowEnd').click();

    await expect(page.locator('#end')).toHaveValue('20:35');
    await expect(page.locator('.mainValue')).toHaveText('10:15');
    await expect(page.locator('.rowkv .v').first()).toHaveText('90 分');
    await expect(page.locator('.rowkv .v').last()).toHaveText('605 分（10時間05分）');
  });
});
