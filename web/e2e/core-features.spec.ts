import { test, expect } from '@playwright/test';

test.describe('Core Features', () => {
  
  test('Code Review Assistant should load analysis', async ({ page }) => {
    await page.goto('/review');
    // Check for the assistant component
    await expect(page.getByText('Code Review Assistant')).toBeVisible();
    // Check if findings are loaded (mock data)
    await expect(page.getByText('Security')).toBeVisible();
  });

  test('Environments page should list environments', async ({ page }) => {
    await page.goto('/environments');
    await expect(page.getByRole('heading', { name: 'Sandbox Environments' })).toBeVisible();
    // Check for mock environments with flexible timeout
    await expect(page.getByText('Local Dev').first()).toBeVisible({ timeout: 10000 });
  });

  test('Video Collaboration should show joining options', async ({ page }) => {
    await page.goto('/video-call');
    await expect(page.getByText('Start Video Call')).toBeVisible();
    await expect(page.getByText('Join with Link')).toBeVisible();
  });

  test('Workflow Canvas should be interactive', async ({ page }) => {
    await page.goto('/workflows/canvas');
    // Wait for page to load, check for any node type
    await expect(page.getByRole('button').first()).toBeVisible({ timeout: 10000 });
  });

});
