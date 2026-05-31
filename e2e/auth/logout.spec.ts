import test, { expect } from '@playwright/test';

const mockUser = {
  first_name: 'mockFirstName',
  second_name: 'mockSecondName',
  login: 'mockLogoutLogin',
  email: 'mock-logout@email.email',
  password: 'mockPasswo@123rd',
  phone: '79999999999',
};

test('should redirect user to sign-in page', async ({ page, request }) => {
  await request.post('http://localhost:3000/auth/signup', { data: mockUser });

  const { login, password } = mockUser;

  await page.context().request.post('http://localhost:3000/auth/signin', {
    data: { login, password },
  });

  await page.goto('/');

  await page.getByRole('button', { name: 'Logout' }).click();

  await expect(page).toHaveURL('/sign-in');
});
