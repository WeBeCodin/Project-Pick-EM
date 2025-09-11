import { test, expect } from '@playwright/test';

test.describe('League Persistence', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto(process.env.BASE_URL || 'http://localhost:3000');
    await expect(page).toBeDefined();
  });
});
