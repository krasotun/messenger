import test, { expect } from '@playwright/test';

test('redirects anonymous user from home to sign in', async ({ page }) => {
  await page.route('**/auth/user', async (route) => {
    await route.fulfill({
      status: 401,
      body: '',
    });
  });

  await page.goto('/');

  await expect(page).toHaveURL('/sign-in');
});
