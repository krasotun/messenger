import test, { expect } from '@playwright/test';

const mockUser = {
  first_name: 'mockFirstName',
  second_name: 'mockSecondName',
  login: 'mockToastScreenshotLogin',
  email: 'mock-toast-screenshot@email.email',
  password: 'mockPasswo@123rd',
  phone: '79999999999',
};

const takenLoginUser = {
  ...mockUser,
  login: 'mockToastTakenLogin',
  email: 'mock-toast-taken@email.email',
};

test('toast stack @visual', async ({ page, request }) => {
  await request.post('http://localhost:3000/auth/signup', { data: takenLoginUser });
  await request.post('http://localhost:3000/auth/signup', { data: mockUser });

  const { login, password } = mockUser;

  await page.context().request.post('http://localhost:3000/auth/signin', {
    data: { login, password },
  });

  // Часы ставятся до загрузки и идут своим ходом: замороженное время не дает
  // CDK открыть ни поповер, ни модалку. Пауза - только перед снимком.
  await page.clock.install();

  await page.goto('/');

  await expect(page.getByText('No chats yet')).toBeVisible();

  await page.getByRole('button', { name: `Avatar ${mockUser.first_name}` }).click();
  await page.getByRole('button', { name: 'Edit profile' }).click();

  const modal = page.getByRole('dialog');

  await expect(modal).toBeVisible();

  const loginInput = modal.getByRole('textbox', { name: 'Login' });

  await loginInput.fill(takenLoginUser.login);
  await modal.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Failed to update profile')).toBeVisible();

  // Оба уведомления поднимаются из одной открытой модалки: между ними один
  // fill и один клик, поэтому первое не успевает погаснуть.
  await loginInput.fill(login);
  await modal.getByRole('button', { name: 'Save' }).click();

  await expect(modal).toBeHidden();

  await expect(page.getByText('Update profile', { exact: true })).toBeVisible();
  await expect(page.getByText('Profile updated successfully')).toBeVisible();
  await expect(page.getByText('Login already exists')).toBeVisible();

  // Угасание останавливается явно, снимок не зависит от интервала по умолчанию.
  await page.clock.pauseAt(Date.now());

  await expect(page).toHaveScreenshot('toast-stack.png', { maxDiffPixels: 2000 });
});
