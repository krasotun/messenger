import test, { expect } from '@playwright/test';

const mockUser = {
  first_name: 'mockFirstName',
  second_name: 'mockSecondName',
  login: 'mockRestoreSessionLogin',
  email: 'mock-restore-session@email.email',
  password: 'mockPasswo@123rd',
  phone: '79999999999',
};

test('redirects anonymous user from home to sign in', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveURL('/sign-in');
});

test('restores current session for authenticated user opening home', async ({ page, request }) => {
  await request.post('http://localhost:3000/auth/signup', { data: mockUser });

  const { login, password } = mockUser;

  await page.context().request.post('http://localhost:3000/auth/signin', {
    data: { login, password },
  });

  await page.goto('/');

  await expect(page.getByText('Chats')).toBeVisible();
});
