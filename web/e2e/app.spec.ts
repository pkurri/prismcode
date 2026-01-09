import { test, expect } from '@playwright/test';

test.describe('PrismCode E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('homepage loads and displays dashboard', async ({ page }) => {
    await expect(page).toHaveTitle(/PrismCode/);
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('navigation works correctly', async ({ page }) => {
    // Click on Assistant
    await page.click('text=AI Assistant');
    await expect(page.url()).toContain('/assistant');

    // Click on Code Review
    await page.click('text=Code Review');
    await expect(page.url()).toContain('/review');

    // Click on Integrations
    await page.click('text=Integrations');
    await expect(page.url()).toContain('/integrations');
  });

  test('code review page displays PRs', async ({ page }) => {
    await page.goto('/review');

    await expect(page.locator('h1')).toContainText('Code Review');
    await expect(page.locator('text=Open Pull Requests')).toBeVisible();
  });

  test('integrations page shows integration cards', async ({ page }) => {
    await page.goto('/integrations');

    await expect(page.locator('h1')).toContainText('Integrations');
    await expect(page.locator('text=GitHub')).toBeVisible();
  });

  test('workflows page displays canvas', async ({ page }) => {
    await page.goto('/workflows');

    await expect(page.locator('h1')).toContainText('Workflow Builder');
    await expect(page.locator('text=Canvas')).toBeVisible();
  });

  test('models page shows model table', async ({ page }) => {
    await page.goto('/models');

    await expect(page.locator('h1')).toContainText('AI Models');
    await expect(page.locator('text=Available Models')).toBeVisible();
  });

  test('achievements page displays badges', async ({ page }) => {
    await page.goto('/achievements');

    await expect(page.locator('h1')).toContainText('Achievements');
    await expect(page.locator('text=Badges')).toBeVisible();
  });

  test('sandbox page loads preview', async ({ page }) => {
    await page.goto('/sandbox');

    await expect(page.locator('h1')).toContainText('Preview Sandbox');
    await expect(page.locator('text=Environments')).toBeVisible();
  });

  test('dashboards page shows builder', async ({ page }) => {
    await page.goto('/dashboards');

    await expect(page.locator('h1')).toContainText('Data Visualization');
    await expect(page.locator('text=Widgets')).toBeVisible();
  });

  test('signin page is accessible', async ({ page }) => {
    await page.goto('/auth/signin');

    await expect(page.locator('text=Welcome to PrismCode')).toBeVisible();
    await expect(page.locator('text=Continue with GitHub')).toBeVisible();
  });

  test('settings page loads', async ({ page }) => {
    await page.goto('/settings');

    await expect(page.locator('h1')).toContainText('Settings');
  });
});

test.describe('API Routes', () => {
  test('GET /api/analysis returns data', async ({ request }) => {
    const response = await request.get('/api/analysis');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('totalFiles');
  });

  test('GET /api/models returns models', async ({ request }) => {
    const response = await request.get('/api/models');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.models).toBeDefined();
  });

  test('GET /api/integrations returns integrations', async ({ request }) => {
    const response = await request.get('/api/integrations');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.success).toBe(true);
  });
});
