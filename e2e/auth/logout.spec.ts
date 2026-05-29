import test, { expect } from '@playwright/test';

test('should redirect user to sign-in page', async ({ page }) => {
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

  await page.route('**/auth/logout', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/plain',
      body: 'OK',
    });
  });
  await page.getByRole('button', { name: 'Logout' }).click();

  await expect(page).toHaveURL('/sign-in');
});
