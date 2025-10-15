import { test, expect, Page } from '@playwright/test';

/**
 * Visual Regression Test Suite
 * 
 * This suite captures screenshots of key UI components and pages
 * to detect unintended visual changes across different viewports.
 * 
 * Run locally:
 *   npm run test:visual
 * 
 * Update baselines:
 *   npm run test:visual -- --update-snapshots
 * 
 * CI mode:
 *   Tests run in headless mode with artifacts uploaded on failure
 */

// Helper to wait for page to be fully loaded
async function waitForPageReady(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
  
  // Wait for any animations to complete
  await page.waitForTimeout(500);
}

test.describe('Visual Regression Tests', () => {
  test.describe('Homepage', () => {
    test('should match homepage snapshot - desktop', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);
      
      // Capture full page screenshot
      await expect(page).toHaveScreenshot('homepage-desktop.png', {
        fullPage: true,
      });
    });

    test('should match homepage snapshot - mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/');
      await waitForPageReady(page);
      
      await expect(page).toHaveScreenshot('homepage-mobile.png', {
        fullPage: true,
      });
    });

    test('should match homepage hero section', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);
      
      const hero = page.locator('header, [role="banner"], .hero, main > section:first-child').first();
      
      if (await hero.count() > 0) {
        await expect(hero).toHaveScreenshot('homepage-hero.png');
      }
    });
  });

  test.describe('Leagues Page', () => {
    test('should match leagues list - desktop', async ({ page }) => {
      await page.goto('/leagues');
      await waitForPageReady(page);
      
      await expect(page).toHaveScreenshot('leagues-page-desktop.png', {
        fullPage: true,
      });
    });

    test('should match leagues list - tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await page.goto('/leagues');
      await waitForPageReady(page);
      
      await expect(page).toHaveScreenshot('leagues-page-tablet.png', {
        fullPage: true,
      });
    });

    test('should match leagues list - mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/leagues');
      await waitForPageReady(page);
      
      await expect(page).toHaveScreenshot('leagues-page-mobile.png', {
        fullPage: true,
      });
    });

    test('should match league card component', async ({ page }) => {
      await page.goto('/leagues');
      await waitForPageReady(page);
      
      // Find first league card (adjust selector based on actual markup)
      const leagueCard = page.locator('[data-testid="league-card"], .league-card, article').first();
      
      if (await leagueCard.count() > 0) {
        await expect(leagueCard).toHaveScreenshot('league-card-default.png');
      }
    });
  });

  test.describe('Navigation', () => {
    test('should match navigation bar - desktop', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);
      
      const nav = page.locator('nav, [role="navigation"]').first();
      
      if (await nav.count() > 0) {
        await expect(nav).toHaveScreenshot('navigation-desktop.png');
      }
    });

    test('should match navigation bar - mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/');
      await waitForPageReady(page);
      
      const nav = page.locator('nav, [role="navigation"]').first();
      
      if (await nav.count() > 0) {
        await expect(nav).toHaveScreenshot('navigation-mobile.png');
      }
    });
  });

  test.describe('Component States', () => {
    test('should capture button states', async ({ page }) => {
      await page.goto('/leagues');
      await waitForPageReady(page);
      
      // Find a button (adjust selector as needed)
      const button = page.locator('button, [role="button"]').first();
      
      if (await button.count() > 0) {
        // Default state
        await expect(button).toHaveScreenshot('button-default.png');
        
        // Hover state
        await button.hover();
        await page.waitForTimeout(200);
        await expect(button).toHaveScreenshot('button-hover.png');
        
        // Focus state
        await button.focus();
        await page.waitForTimeout(200);
        await expect(button).toHaveScreenshot('button-focus.png');
      }
    });

    test('should capture form input states', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);
      
      // Find first input (adjust selector as needed)
      const input = page.locator('input[type="text"], input[type="email"]').first();
      
      if (await input.count() > 0) {
        // Default state
        await expect(input).toHaveScreenshot('input-default.png');
        
        // Focus state
        await input.focus();
        await page.waitForTimeout(200);
        await expect(input).toHaveScreenshot('input-focus.png');
        
        // Filled state
        await input.fill('Test Input');
        await expect(input).toHaveScreenshot('input-filled.png');
      }
    });
  });

  test.describe('Responsive Layouts', () => {
    const viewports = [
      { name: 'mobile-sm', width: 320, height: 568 },
      { name: 'mobile', width: 375, height: 667 },
      { name: 'mobile-lg', width: 414, height: 896 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1280, height: 720 },
      { name: 'desktop-xl', width: 1920, height: 1080 },
    ];

    for (const viewport of viewports) {
      test(`should render correctly at ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        
        await page.goto('/');
        await waitForPageReady(page);
        
        await expect(page).toHaveScreenshot(`homepage-${viewport.name}.png`, {
          fullPage: false, // Just viewport for responsive tests
        });
      });
    }
  });

  test.describe('Accessibility - Visual Checks', () => {
    test('should have visible focus indicators', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);
      
      // Tab through focusable elements
      const focusableElements = await page.locator('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])').all();
      
      if (focusableElements.length > 0) {
        // Focus first few elements and capture
        for (let i = 0; i < Math.min(3, focusableElements.length); i++) {
          await focusableElements[i].focus();
          await page.waitForTimeout(200);
          await expect(focusableElements[i]).toHaveScreenshot(`focus-indicator-${i}.png`);
        }
      }
    });

    test('should maintain layout without images', async ({ page }) => {
      // Block images to test alt text and layout
      await page.route('**/*.{png,jpg,jpeg,gif,webp,svg}', route => route.abort());
      
      await page.goto('/');
      await waitForPageReady(page);
      
      await expect(page).toHaveScreenshot('layout-without-images.png', {
        fullPage: true,
      });
    });
  });

  test.describe('Dark Mode (if supported)', () => {
    test('should match dark mode - desktop', async ({ page }) => {
      // Emulate dark mode preference
      await page.emulateMedia({ colorScheme: 'dark' });
      
      await page.goto('/');
      await waitForPageReady(page);
      
      await expect(page).toHaveScreenshot('homepage-dark-mode.png', {
        fullPage: true,
      });
    });
  });

  test.describe('Error States', () => {
    test('should capture 404 page', async ({ page }) => {
      await page.goto('/this-page-does-not-exist-12345');
      await waitForPageReady(page);
      
      await expect(page).toHaveScreenshot('404-page.png', {
        fullPage: true,
      });
    });
  });
});

test.describe('Performance - Visual Checks', () => {
  test('should not have layout shift on load', async ({ page }) => {
    await page.goto('/');
    
    // Capture immediately
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveScreenshot('layout-initial.png', {
      fullPage: false,
    });
    
    // Capture after full load
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('layout-loaded.png', {
      fullPage: false,
    });
    
    // These should be nearly identical if no layout shift occurs
  });
});

test.describe('Print Styles', () => {
  test('should have appropriate print layout', async ({ page }) => {
    await page.goto('/leagues');
    await waitForPageReady(page);
    
    // Emulate print media
    await page.emulateMedia({ media: 'print' });
    
    await expect(page).toHaveScreenshot('leagues-print.png', {
      fullPage: true,
    });
  });
});
