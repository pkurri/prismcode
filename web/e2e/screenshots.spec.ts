import { test, expect } from '@playwright/test';

test.describe('Screenshot Tests', () => {
  test('Dashboard page screenshot', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveScreenshot('dashboard.png', { maxDiffPixels: 100 });
  });

  test('Code Review page screenshot', async ({ page }) => {
    await page.goto('/review');
    await expect(page.getByText('Code Review Assistant')).toBeVisible();
    await expect(page).toHaveScreenshot('code-review.png', { maxDiffPixels: 100 });
  });

  test('Sandbox page screenshot', async ({ page }) => {
    await page.goto('/sandbox');
    await expect(page.getByPlaceholder(/Describe/i)).toBeVisible();
    await expect(page).toHaveScreenshot('sandbox.png', { maxDiffPixels: 100 });
  });

  test('Environments page screenshot', async ({ page }) => {
    await page.goto('/environments');
    await expect(page.getByRole('heading', { name: 'Sandbox Environments' })).toBeVisible();
    await expect(page).toHaveScreenshot('environments.png', { maxDiffPixels: 100 });
  });

  test('Orchestrator page screenshot', async ({ page }) => {
    await page.goto('/orchestrator');
    await expect(page.locator('h1, h2, h3').first()).toBeVisible();
    await expect(page).toHaveScreenshot('orchestrator.png', { maxDiffPixels: 100 });
  });

  test('Agent Visualization page screenshot', async ({ page }) => {
    await page.goto('/agent-visualization');
    await expect(page.getByRole('tab', { name: 'Timeline' })).toBeVisible();
    await expect(page).toHaveScreenshot('agent-visualization.png', { maxDiffPixels: 100 });
  });

  test('Ask page screenshot', async ({ page }) => {
    await page.goto('/ask');
    await expect(page.getByRole('heading', { name: 'Knowledge Base' })).toBeVisible();
    await expect(page).toHaveScreenshot('ask.png', { maxDiffPixels: 100 });
  });

  test('Team page screenshot', async ({ page }) => {
    await page.goto('/team');
    await expect(page.locator('h1, h2, h3').first()).toBeVisible();
    await expect(page).toHaveScreenshot('team.png', { maxDiffPixels: 100 });
  });
});
