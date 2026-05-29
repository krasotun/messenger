import { test, expect } from '@playwright/test';

test('sign-in empty form', async ({ page }) => {
  await page.route('**/auth/user', async (route) => {
    await route.fulfill({ status: 401, body: '' });
  });

  await page.goto('/sign-in');

  await expect(page.getByRole('textbox', { name: 'Login' })).toBeVisible();

  await expect(page).toHaveScreenshot('sign-in-empty-form.png');
});
