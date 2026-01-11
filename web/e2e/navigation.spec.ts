import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the dashboard by default', async ({ page }) => {
    await expect(page).toHaveTitle(/PrismCode/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  const categories = [
    { name: 'Intelligence', link: 'AI Assistant' },
    { name: 'Code Quality', link: 'Quality Dashboard' },
    { name: 'DevOps & Infra', link: 'Environments' },
    { name: 'Collaboration', link: 'Team' },
    { name: 'Tools', link: 'Workflow Builder' }
  ];

  for (const category of categories) {
    test(`should display ${category.name} category`, async ({ page }) => {
      // Use exact match and ensure it's within the sidebar context
      await expect(page.locator('[data-sidebar="group-label"]').getByText(category.name, { exact: true })).toBeVisible();
    });
  }
  
  test('should navigate to Code Review page', async ({ page }) => {
    await page.getByRole('link', { name: 'Code Review' }).click();
    await expect(page).toHaveURL(/.*review/);
    await expect(page.getByText('Code Review Assistant')).toBeVisible(); 
  });

  test('should navigate to Environments page', async ({ page }) => {
    await page.getByRole('link', { name: 'Environments' }).click();
    await expect(page).toHaveURL(/.*environments/);
    await expect(page.getByRole('heading', { name: 'Sandbox Environments' })).toBeVisible();
  });
});
