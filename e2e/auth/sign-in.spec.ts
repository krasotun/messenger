import { test, expect, Page } from '@playwright/test';

const mockUser = {
  first_name: 'mockFirstName',
  second_name: 'mockSecondName',
  login: 'mockSignInLogin',
  email: 'mock-sign-in@email.email',
  password: 'mockPasswo@123rd',
  phone: '79999999999',
};

const fillValidSignInForm = async (page: Page) => {
  const { login, password } = mockUser;

  await page.getByRole('textbox', { name: 'Login' }).fill(login);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
};

test.beforeEach(async ({ request }) => {
  await request.post('http://localhost:3000/test/reset');
});

test('should go to main page after successful sign in', async ({ page, request }) => {
  await request.post('http://localhost:3000/auth/signup', { data: mockUser });

  await page.goto('/sign-in');

  await expect(page.getByRole('textbox', { name: 'Login' })).toBeVisible();

  await fillValidSignInForm(page);

  await page.getByRole('button', { name: 'Log in' }).click();

  await expect(page).toHaveURL('/');
});

test('should show authorization error when sign in fails', async ({ page }) => {
  await page.goto('/sign-in');

  await fillValidSignInForm(page);

  await page.getByRole('button', { name: 'Log in' }).click();

  await expect(page).toHaveURL('/sign-in');

  await expect(
    page.getByText('Ошибка авторизации: Failed to sign in. Please try again.'),
  ).toBeVisible();
});
