import test, { expect } from '@playwright/test';

const mockUser = {
  first_name: 'mockFirstName',
  second_name: 'mockSecondName',
  login: 'mockChangePasswordLogin',
  email: 'mock-change-password@email.email',
  password: 'mockPasswo@123rd',
  phone: '79999999999',
};

const newPassword = 'newMockPasswo@123rd';

const openChangePasswordForm = async (page: import('@playwright/test').Page) => {
  await page.getByRole('button', { name: `Avatar ${mockUser.first_name}` }).click();
  await page.getByRole('button', { name: 'Change password' }).click();
};

test('changes the password and keeps the user in the application', async ({ page, request }) => {
  await request.post('http://localhost:3000/auth/signup', { data: mockUser });

  const { login, password } = mockUser;

  await page.context().request.post('http://localhost:3000/auth/signin', {
    data: { login, password },
  });

  await page.goto('/');

  await openChangePasswordForm(page);

  await page.getByRole('textbox', { name: 'Old password' }).fill(password);
  await page.getByRole('textbox', { name: 'New password', exact: true }).fill(newPassword);
  await page.getByRole('textbox', { name: 'Repeat new password' }).fill(newPassword);

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByRole('dialog')).toBeHidden();

  await expect(page.getByRole('button', { name: `Avatar ${mockUser.first_name}` })).toBeVisible();

  const signInWithOldPassword = await request.post('http://localhost:3000/auth/signin', {
    data: { login, password },
  });

  expect(signInWithOldPassword.status()).toBe(400);

  const signInWithNewPassword = await request.post('http://localhost:3000/auth/signin', {
    data: { login, password: newPassword },
  });

  expect(signInWithNewPassword.ok()).toBe(true);
});

test('keeps the form open with an error when the old password is wrong', async ({
  page,
  request,
}) => {
  const rejectedUser = {
    ...mockUser,
    login: 'mockRejectedChangePasswordLogin',
    email: 'mock-rejected-change-password@email.email',
  };

  await request.post('http://localhost:3000/auth/signup', { data: rejectedUser });

  await page.context().request.post('http://localhost:3000/auth/signin', {
    data: { login: rejectedUser.login, password: rejectedUser.password },
  });

  await page.goto('/');

  await page.getByRole('button', { name: `Avatar ${rejectedUser.first_name}` }).click();
  await page.getByRole('button', { name: 'Change password' }).click();

  await page.getByRole('textbox', { name: 'Old password' }).fill('wrongOldPassword');
  await page.getByRole('textbox', { name: 'New password', exact: true }).fill(newPassword);
  await page.getByRole('textbox', { name: 'Repeat new password' }).fill(newPassword);

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Ошибка смены пароля: Password is incorrect')).toBeVisible();

  await expect(page.getByRole('dialog')).toBeVisible();
});
