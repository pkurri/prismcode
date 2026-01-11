import { test, expect } from '@playwright/test';

test.describe('Codebase Q&A', () => {
  test('should answer common architecture questions', async ({ page }) => {
    // 1. Navigate to Ask page
    await page.goto('/ask');
    await expect(page.getByRole('heading', { name: 'Knowledge Base' })).toBeVisible();

    // 2. Clear pre-filled suggestions or new conversation
    const input = page.getByPlaceholder('Ask a question about the codebase...');
    
    // 3. Ask a question
    await input.fill('How does authentication work?');
    await page.getByRole('button', { name: '↑' }).click();

    // 4. Wait for response
    await expect(page.getByText('NextAuth.js')).toBeVisible({ timeout: 10000 });
    
    // 5. Check for sources
    // Use .first() as the text appears in both the generated answer and the source badge
    await expect(page.getByText('web/src/middleware.ts').first()).toBeVisible();
  });

  test('should handle unknown queries gracefully', async ({ page }) => {
    await page.goto('/ask');
    
    const input = page.getByPlaceholder('Ask a question about the codebase...');
    await input.fill('What is the meaning of life?');
    await page.getByRole('button', { name: '↑' }).click();

    // The text might be split across elements by markdown, so match a substring
    await expect(page.getByText(/couldn't generate a specific answer/)).toBeVisible({ timeout: 15000 });
  });
});
