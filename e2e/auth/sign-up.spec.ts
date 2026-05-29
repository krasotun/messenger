import { test, expect, Page } from '@playwright/test';

const { firstName, secondName, login, email, password, phone } = {
  firstName: 'mockFirstName',
  secondName: 'mockSecondName',
  login: 'mockLogin',
  email: 'mock@email.email',
  password: 'mockPasswo@123rd',
  phone: '79999999999',
};

const fillValidSignUpForm = async (page: Page) => {
  await page.getByRole('textbox', { name: 'First name' }).fill(firstName);
  await page.getByRole('textbox', { name: 'Second name' }).fill(secondName);
  await page.getByRole('textbox', { name: 'Login' }).fill(login);
  await page.getByRole('textbox', { name: 'Email' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('textbox', { name: 'Mobile phone' }).fill(phone);
};

test.beforeEach(async ({ page }) => {
  await page.route('**/auth/user', async (route) => {
    await route.fulfill({ status: 401, body: '' });
  });

  await page.goto('/sign-up');
});

test('should go to sign-in page after successful sign up', async ({ page }) => {
  await page.route('**/auth/signup', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: { id: 1 },
    });
  });

  await fillValidSignUpForm(page);

  await page.getByRole('button', { name: 'Register' }).click();

  await expect(page).toHaveURL('/sign-in');
});

test('should show registration error when sign up fails', async ({ page }) => {
  await page.route('**/auth/signup', async (route) => {
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      json: { reason: 'Login already exists' },
    });
  });

  await fillValidSignUpForm(page);

  await page.getByRole('button', { name: 'Register' }).click();

  await expect(page).toHaveURL('/sign-up');
  await expect(page.getByText('Ошибка регистрации: Login already exists')).toBeVisible();
});
