import { test, expect, Page } from '@playwright/test';

const successfulSignUpUser = {
  first_name: 'mockFirstName',
  second_name: 'mockSecondName',
  login: 'mockSuccessfulSignUpLogin',
  email: 'mock-successful-sign-up@email.email',
  password: 'mockPasswo@123rd',
  phone: '79999999999',
};

const duplicateSignUpUser = {
  first_name: 'mockFirstName',
  second_name: 'mockSecondName',
  login: 'mockDuplicateSignUpLogin',
  email: 'mock-duplicate-sign-up@email.email',
  password: 'mockPasswo@123rd',
  phone: '79999999999',
};

const fillValidSignUpForm = async (
  page: Page,
  { first_name, second_name, login, email, password, phone }: typeof successfulSignUpUser,
) => {
  await page.getByRole('textbox', { name: 'First name' }).fill(first_name);
  await page.getByRole('textbox', { name: 'Second name' }).fill(second_name);
  await page.getByRole('textbox', { name: 'Login' }).fill(login);
  await page.getByRole('textbox', { name: 'Email' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('textbox', { name: 'Mobile phone' }).fill(phone);
};

test('should go to sign-in page after successful sign up', async ({ page }) => {
  await page.goto('/sign-up');

  await fillValidSignUpForm(page, successfulSignUpUser);

  await page.getByRole('button', { name: 'Register' }).click();

  await expect(page).toHaveURL('/sign-in');
});

test('should show registration error when sign up fails', async ({ page }) => {
  await page.goto('/sign-up');

  await fillValidSignUpForm(page, duplicateSignUpUser);

  await page.getByRole('button', { name: 'Register' }).click();

  await expect(page).toHaveURL('/sign-in');

  await page.goto('/sign-up');

  await fillValidSignUpForm(page, duplicateSignUpUser);

  await page.getByRole('button', { name: 'Register' }).click();

  await expect(page).toHaveURL('/sign-up');
  await expect(page.getByText('Ошибка регистрации: Login already exists')).toBeVisible();
});
