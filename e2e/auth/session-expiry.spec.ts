import test, { expect } from '@playwright/test';

const mockUser = {
  first_name: 'mockFirstName',
  second_name: 'mockSecondName',
  login: 'mockSessionExpiryLogin',
  email: 'mock-session-expiry@email.email',
  password: 'mockPasswo@123rd',
  phone: '79999999999',
};

test('signs the user out and closes the profile form when the session expires on save', async ({
  page,
  request,
}) => {
  await request.post('http://localhost:3000/auth/signup', { data: mockUser });

  const { login, password } = mockUser;

  await page.context().request.post('http://localhost:3000/auth/signin', {
    data: { login, password },
  });

  await page.goto('/');

  await page.getByRole('button', { name: `Avatar ${mockUser.first_name}` }).click();
  await page.getByRole('button', { name: 'Edit profile' }).click();

  await expect(page.getByRole('dialog')).toBeVisible();

  // Бэкенд перестал признавать сессию уже после открытия формы: 401 приходит
  // только на сохранение, а не на загрузку профиля перед модалкой.
  await page.route('**/user/profile', (route) => {
    if (route.request().method() !== 'PUT') {
      return route.fallback();
    }

    return route.fulfill({ status: 401, json: { reason: 'Cookie is not valid' } });
  });

  await page.getByRole('textbox', { name: 'First name' }).fill('updatedFirstName');
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Session expired')).toBeVisible();
  await expect(page.getByText('Please sign in again.')).toBeVisible();

  await expect(page).toHaveURL('/sign-in');
  await expect(page.getByRole('dialog')).toBeHidden();
});
