import { test, expect } from '@playwright/test';

test('basic smoke test', async () => {
  // Just a simple test that always passes to verify Playwright is working
  expect(1 + 1).toBe(2);
  console.log('Playwright is working correctly');
});