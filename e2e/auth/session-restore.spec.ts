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

test('restores current session for authenticated user opening home', async ({ page }) => {
  await page.route('**/auth/user', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: {
        id: 1,
        first_name: 'Mock',
        second_name: 'User',
        display_name: null,
        login: 'mockLogin',
        email: 'mock@email.email',
        phone: '79999999999',
        avatar: null,
      },
    });
  });

  await page.goto('/');

  await expect(page.getByText('You are signed in.')).toBeVisible();
});
