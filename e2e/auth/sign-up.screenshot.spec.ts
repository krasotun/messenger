import { test, expect } from '@playwright/test';

test('sign-up empty form', async ({ page }) => {
  await page.route('**/auth/user', async (route) => {
    await route.fulfill({ status: 401, body: '' });
  });

  await page.goto('/sign-up');

  await expect(page.getByRole('heading', { name: 'Registration' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Register' })).toBeVisible();

  await expect(page).toHaveScreenshot('sign-up-empty-form.png');
});
