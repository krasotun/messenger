import test, { expect } from '@playwright/test';

const mockUser = {
  first_name: 'mockFirstName',
  second_name: 'mockSecondName',
  login: 'mockChangePasswordModalScreenshotLogin',
  email: 'mock-change-password-modal-screenshot@email.email',
  password: 'mockPasswo@123rd',
  phone: '79999999999',
};

test('change password modal @visual', async ({ page, request }) => {
  await request.post('http://localhost:3000/auth/signup', { data: mockUser });

  const { login, password } = mockUser;

  await page.context().request.post('http://localhost:3000/auth/signin', {
    data: { login, password },
  });

  await page.goto('/');

  await page.getByRole('button', { name: `Avatar ${mockUser.first_name}` }).click();
  await page.getByRole('button', { name: 'Change password' }).click();

  const modal = page.getByRole('dialog');

  await expect(modal).toBeVisible();
  await expect(modal.getByRole('textbox', { name: 'Old password' })).toHaveValue('');

  await expect(page).toHaveScreenshot('change-password-modal.png', { maxDiffPixels: 2000 });
});
