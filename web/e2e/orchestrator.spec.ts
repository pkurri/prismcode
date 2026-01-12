import { test, expect } from '@playwright/test';

test.describe('Agent Orchestrator', () => {
  test('should load orchestrator page', async ({ page }) => {
    await page.goto('/orchestrator');
    // Check for any content indicating the page loaded
    await expect(page.locator('h1, h2, h3').first()).toBeVisible();
  });

  test('should display tabs', async ({ page }) => {
    await page.goto('/orchestrator');
    // Look for tab elements with flexible matching
    const tabs = page.locator('[role="tab"]');
    await expect(tabs.first()).toBeVisible();
  });

  test('should have interactive elements', async ({ page }) => {
    await page.goto('/orchestrator');
    // Check for buttons
    const buttons = page.getByRole('button');
    await expect(buttons.first()).toBeVisible();
  });
});

test.describe('Agent Visualization', () => {
  test('should load visualization page', async ({ page }) => {
    await page.goto('/agent-visualization');
    // Check page has loaded with content
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('should display timeline tab', async ({ page }) => {
    await page.goto('/agent-visualization');
    // Use first() to handle multiple matches
    await expect(page.getByRole('tab', { name: 'Timeline' })).toBeVisible();
  });
});
