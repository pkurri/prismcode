import { test, expect } from '@playwright/test';

test.describe('Agent Orchestrator', () => {
  test('should load orchestrator page', async ({ page }) => {
    await page.goto('/orchestrator');
    await expect(page.getByText('Multi-Agent Orchestrator')).toBeVisible();
  });

  test('should display agent tabs', async ({ page }) => {
    await page.goto('/orchestrator');
    await expect(page.getByRole('tab', { name: /Active/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /History/i })).toBeVisible();
  });

  test('should show task creation UI', async ({ page }) => {
    await page.goto('/orchestrator');
    await expect(page.getByText('Create Task')).toBeVisible();
  });

  test('should navigate between tabs', async ({ page }) => {
    await page.goto('/orchestrator');
    
    // Click History tab
    await page.getByRole('tab', { name: /History/i }).click();
    
    // Should show history content
    await expect(page.getByText(/completed/i)).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Agent Visualization', () => {
  test('should load visualization page', async ({ page }) => {
    await page.goto('/agent-visualization');
    await expect(page.getByText('Agent Visualization')).toBeVisible();
  });

  test('should display timeline view', async ({ page }) => {
    await page.goto('/agent-visualization');
    await expect(page.getByText(/Timeline/i)).toBeVisible();
  });
});
