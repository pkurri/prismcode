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
    // Check for mock environments
    await expect(page.getByText('Local Dev').first()).toBeVisible();
    await expect(page.getByText('staging-us-east').first()).toBeVisible();
  });

  test('Video Collaboration should show joining options', async ({ page }) => {
    await page.goto('/video-call');
    await expect(page.getByText('Start Video Call')).toBeVisible();
    await expect(page.getByText('Join with Link')).toBeVisible();
  });

  test('Workflow Canvas should be interactive', async ({ page }) => {
    await page.goto('/workflows/canvas');
    await expect(page.getByText('GitHub PR').first()).toBeVisible();
    // Check if node types are available in the palette
    await expect(page.getByText('Trigger', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Action', { exact: true }).first()).toBeVisible();
  });

});
