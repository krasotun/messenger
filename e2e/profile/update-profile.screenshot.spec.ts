import test, { expect } from '@playwright/test';

const mockUser = {
  first_name: 'mockFirstName',
  second_name: 'mockSecondName',
  login: 'mockProfileModalScreenshotLogin',
  email: 'mock-profile-modal-screenshot@email.email',
  password: 'mockPasswo@123rd',
  phone: '79999999999',
};

test('profile modal @visual', async ({ page, request }) => {
  await request.post('http://localhost:3000/auth/signup', { data: mockUser });

  const { login, password } = mockUser;

  await page.context().request.post('http://localhost:3000/auth/signin', {
    data: { login, password },
  });

  await page.goto('/');

  await page.getByRole('button', { name: `Avatar ${mockUser.first_name}` }).click();
  await page.getByRole('button', { name: 'Edit profile' }).click();

  const modal = page.getByRole('dialog');

  await expect(modal).toBeVisible();
  await expect(modal.getByRole('textbox', { name: 'First name' })).toHaveValue(mockUser.first_name);

  await expect(page).toHaveScreenshot('profile-modal.png', { maxDiffPixels: 2000 });
});
