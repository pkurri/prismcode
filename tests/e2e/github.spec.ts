import { test, expect } from '@playwright/test';

test.describe('GitHub Integration', () => {
    test('should load GitHub repository page', async ({ page }) => {
        await page.goto('https://github.com/pkurri/prismcode');
        await expect(page).toHaveTitle(/prismcode/);
    });

    test('should have README visible', async ({ page }) => {
        await page.goto('https://github.com/pkurri/prismcode');
        const readme = page.locator('#readme');
        await expect(readme).toBeVisible();
    });
});
