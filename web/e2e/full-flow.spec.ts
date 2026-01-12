import { test, expect } from '@playwright/test';

test.describe('Settings & Theme', () => {
  test('should load settings page', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: /Settings/i })).toBeVisible();
  });

  test('should display preference sections', async ({ page }) => {
    await page.goto('/settings');
    // Check for common settings sections
    await expect(page.getByText(/General/i).first()).toBeVisible();
  });
});

test.describe('Full User Journey', () => {
  test('complete workflow: Dashboard -> Review -> Sandbox', async ({ page }) => {
    // Start at Dashboard
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    
    // Navigate to Code Review
    await page.getByRole('link', { name: 'Code Review' }).click();
    await expect(page.getByText('Code Review Assistant')).toBeVisible();
    
    // Navigate to Sandbox
    await page.getByRole('link', { name: 'Sandbox' }).click();
    await expect(page.getByPlaceholder(/Describe/i)).toBeVisible();
  });

  test('should handle 404 gracefully', async ({ page }) => {
    await page.goto('/non-existent-page-xyz');
    // Next.js shows 404 page
    await expect(page.getByText(/404/i)).toBeVisible();
  });
});
