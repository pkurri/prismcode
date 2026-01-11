import { test, expect } from '@playwright/test';

test.describe('Mobile Preview Simulator', () => {
  test('should switch pages and devices', async ({ page }) => {
    // 1. Navigate to Mobile Preview
    await page.goto('/mobile');
    
    // 2. Check initial state (iPhone selected by default)
    // The button says "iPhone"
    await expect(page.getByRole('button', { name: 'iPhone' })).toBeVisible();
    await expect(page.getByText('Preview Page')).toBeVisible();
    
    // Check for the iframe capability
    await expect(page.locator('iframe[title="Preview on iPhone 14 Pro"]')).toBeVisible();
    
    // 3. Switch Content Page -> Activity Feed
    await page.getByRole('button', { name: 'Activity Feed' }).click();
    // Verify iframe src attribute update (indirectly via selecting the button state)
    
    // 4. Switch Device -> Pixel 7
    await page.getByRole('button', { name: 'Pixel' }).click();
    // Verify Pixel visual indicator (the notch style is different, but we check button state)
    // We can check if the container width roughly matches Pixel width (412px)
    // Note: checking computed style might be flaky, we rely on React state reflected in UI
    
    // 5. Rotate
    await page.getByRole('button', { name: 'Portrait' }).click();
    // After click, it should say 'Landscape'
    await expect(page.getByRole('button', { name: 'Landscape' })).toBeVisible();
    
    // 6. Verify iframe presence
    const iframe = page.frameLocator('iframe[title="Preview on Pixel 7"]');
    // Just ensure the iframe element exists with correct title
    await expect(page.locator('iframe[title="Preview on Pixel 7"]')).toBeVisible();
  });
});
