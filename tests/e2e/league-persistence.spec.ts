import { test, expect } from '@playwright/test';

test.describe('League Persistence & User Sessions', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
  });

  test('should maintain league membership after logout/login cycle', async ({ page }) => {
    // Step 1: Create a league
    await page.goto('/leagues');
    await page.click('text=Create League');
    
    await page.fill('[name="name"]', 'E2E Test League');
    await page.fill('[name="description"]', 'Testing session persistence');
    await page.selectOption('[name="scoringType"]', 'CONFIDENCE');
    await page.click('button[type="submit"]');
    
    // Verify league creation
    await expect(page.locator('text=E2E Test League')).toBeVisible();
    const memberCount = await page.locator('.member-count').first();
    await expect(memberCount).toContainText('1');
    
    // Step 2: Note the league details
    const leagueId = await page.getAttribute('[data-league-id]', 'data-league-id');
    
    // Step 3: Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Logout');
    
    // Verify logout
    await expect(page.locator('text=Login')).toBeVisible();
    
    // Step 4: Login again  
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Step 5: Check if league still exists in user's leagues
    await page.goto('/leagues');
    await expect(page.locator('text=E2E Test League')).toBeVisible();
    
    // Verify member count is still accurate
    const postLoginMemberCount = await page.locator('.member-count').first();
    await expect(postLoginMemberCount).toContainText('1');
    
    // Verify user is still listed as league owner/member
    await page.click('text=E2E Test League');
    await expect(page.locator('[data-testid="member-list"]')).toContainText('test@example.com');
  });

  test('should show consistent member counts across dashboard and league management', async ({ page }) => {
    // Create a league
    await page.goto('/leagues');
    await page.click('text=Create League');
    await page.fill('[name="name"]', 'Count Test League');
    await page.click('button[type="submit"]');
    
    // Check dashboard count
    await page.goto('/dashboard');
    const dashboardCount = await page.locator('[data-testid="league-count"]').textContent();
    
    // Check league management count
    await page.goto('/leagues');
    const leagueListCount = await page.locator('[data-testid="my-leagues"] .league-item').count();
    
    // Counts should match
    expect(parseInt(dashboardCount || '0')).toBe(leagueListCount);
  });

  test('should allow joining and leaving leagues with accurate member tracking', async ({ page }) => {
    // Assuming there's a public league to join
    await page.goto('/leagues');
    await page.click('text=Public Leagues');
    
    const publicLeague = page.locator('.public-league').first();
    const initialCount = await publicLeague.locator('.member-count').textContent();
    
    // Join the league
    await publicLeague.locator('text=Join').click();
    
    // Verify member count increased
    await page.reload();
    const newCount = await publicLeague.locator('.member-count').textContent();
    expect(parseInt(newCount || '0')).toBe(parseInt(initialCount || '0') + 1);
    
    // Leave the league
    await page.goto('/leagues');
    await page.click('text=My Leagues');
    await page.click('text=Leave League');
    await page.click('text=Confirm');
    
    // Verify member count decreased
    await page.goto('/leagues');
    await page.click('text=Public Leagues');
    const finalCount = await publicLeague.locator('.member-count').textContent();
    expect(parseInt(finalCount || '0')).toBe(parseInt(initialCount || '0'));
  });

  test('should preserve scoring system selection', async ({ page }) => {
    // Create league with CONFIDENCE scoring
    await page.goto('/leagues');
    await page.click('text=Create League');
    await page.fill('[name="name"]', 'Scoring Test League');
    await page.selectOption('[name="scoringType"]', 'CONFIDENCE');
    await page.click('button[type="submit"]');
    
    // Verify scoring system is saved
    await page.click('text=Scoring Test League');
    await expect(page.locator('[data-testid="scoring-type"]')).toContainText('CONFIDENCE');
    
    // Ensure no 'spread' or undefined values appear
    await expect(page.locator('text=spread')).not.toBeVisible();
    await expect(page.locator('text=undefined')).not.toBeVisible();
  });

  test('should handle rejoin capability for previously inactive members', async ({ page }) => {
    // This test assumes we can simulate multiple users
    // For now, we'll test the basic rejoin flow
    
    await page.goto('/leagues');
    await page.click('text=Create League');
    await page.fill('[name="name"]', 'Rejoin Test League');
    await page.click('button[type="submit"]');
    
    // Get the league code for later rejoining
    const leagueCode = await page.locator('[data-testid="league-code"]').textContent();
    
    // Leave the league
    await page.click('text=Leave League');
    await page.click('text=Confirm');
    
    // Rejoin using the code
    await page.click('text=Join League');
    await page.fill('[name="code"]', leagueCode || '');
    await page.click('button[type="submit"]');
    
    // Verify successful rejoin
    await expect(page.locator('text=Successfully joined league')).toBeVisible();
    await expect(page.locator('text=Rejoin Test League')).toBeVisible();
  });
});
