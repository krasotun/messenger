import { test, expect, Page } from '@playwright/test';

const { login, password } = {
  login: 'mockLogin',
  password: 'mockPasswo@123rd',
};

const fillValidSignInForm = async (page: Page) => {
  await page.getByRole('textbox', { name: 'Login' }).fill(login);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
};

test('should go to main page after successful sign in', async ({ page }) => {
  await page.route('**/auth/user', async (route) => {
    await route.fulfill({ status: 401, body: '' });
  });

  await page.route('**/auth/signin', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/plain',
      body: 'OK',
    });
  });

  await page.goto('/sign-in');

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

  await fillValidSignInForm(page);
  await page.getByRole('button', { name: 'Log in' }).click();

  await expect(page).toHaveURL('/');
});

test('should show authorization error when sign in fails', async ({ page }) => {
  await page.route('**/auth/user', async (route) => {
    await route.fulfill({ status: 401, body: '' });
  });

  await page.route('**/auth/signin', async (route) => {
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      json: { reason: 'Login already exists' },
    });
  });

  await page.goto('/sign-in');

  await fillValidSignInForm(page);

  await page.getByRole('button', { name: 'Log in' }).click();

  await expect(page).toHaveURL('/sign-in');

  await expect(
    page.getByText('Ошибка авторизации: Failed to sign in. Please try again.'),
  ).toBeVisible();
});
