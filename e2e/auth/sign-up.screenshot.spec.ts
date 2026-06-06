import { test, expect } from '@playwright/test';

test('sign-up empty form @visual', async ({ page }) => {
  await page.goto('/sign-up');

  await expect(page.getByRole('heading', { name: 'Registration' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Register' })).toBeVisible();

  await expect(page).toHaveScreenshot('sign-up-empty-form.png', { maxDiffPixels: 2000 });
});
