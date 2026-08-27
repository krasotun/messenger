import { test, expect, Page } from '@playwright/test';

const successfulSignInUser = {
  first_name: 'mockFirstName',
  second_name: 'mockSecondName',
  login: 'mockSignInLogin',
  email: 'mock-sign-in@email.email',
  password: 'mockPasswo@123rd',
  phone: '79999999999',
};

const fillSignInForm = async (
  page: Page,
  { login, password }: { login: string; password: string },
) => {
  await page.getByRole('textbox', { name: 'Login' }).fill(login);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
};

test('should go to main page after successful sign in', async ({ page, request }) => {
  await request.post('http://localhost:3000/auth/signup', { data: successfulSignInUser });

  await page.goto('/sign-in');

  await expect(page.getByRole('textbox', { name: 'Login' })).toBeVisible();

  await fillSignInForm(page, successfulSignInUser);

  await page.getByRole('button', { name: 'Log in' }).click();

  await expect(page).toHaveURL('/');
});

test('should show authorization error when sign in fails', async ({ page }) => {
  await page.goto('/sign-in');

  await fillSignInForm(page, {
    login: 'unknownSignInLogin',
    password: 'mockPasswo@123rd',
  });

  await page.getByRole('button', { name: 'Log in' }).click();

  await expect(page).toHaveURL('/sign-in');

  await expect(page.getByText('Ошибка авторизации: Invalid login or password')).toBeVisible();
});
