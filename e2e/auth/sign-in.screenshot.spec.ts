import { test, expect } from '@playwright/test';

test('sign-in empty form @visual', async ({ page }) => {
  await page.goto('/sign-in');

  await expect(page.getByRole('textbox', { name: 'Login' })).toBeVisible();

  await expect(page).toHaveScreenshot('sign-in-empty-form.png');
});
