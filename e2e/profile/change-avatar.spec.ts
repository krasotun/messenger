import test, { APIRequestContext, expect, Page } from '@playwright/test';

const mockUser = {
  first_name: 'mockFirstName',
  second_name: 'mockSecondName',
  login: 'mockChangeAvatarLogin',
  email: 'mock-change-avatar@email.email',
  password: 'mockPasswo@123rd',
  phone: '79999999999',
};

const pngFile = {
  name: 'avatar.png',
  mimeType: 'image/png',
  buffer: Buffer.from('mockPngContent'),
};

const pdfFile = {
  name: 'avatar.pdf',
  mimeType: 'application/pdf',
  buffer: Buffer.from('mockPdfContent'),
};

const signUpAndOpenProfile = async (
  { page, request }: { page: Page; request: APIRequestContext },
  login: string,
) => {
  const user = { ...mockUser, login, email: `${login}@email.email` };

  await request.post('http://localhost:3000/auth/signup', { data: user });

  await page.context().request.post('http://localhost:3000/auth/signin', {
    data: { login: user.login, password: user.password },
  });

  await page.goto('/');

  await page.getByRole('button', { name: `Avatar ${user.first_name}` }).click();
  await page.getByRole('button', { name: 'Edit profile' }).click();

  await expect(page.getByRole('dialog')).toBeVisible();
};

test('shows the new avatar without page reload', async ({ page, request }) => {
  await signUpAndOpenProfile({ page, request }, 'mockChangeAvatarLogin');

  const modal = page.getByRole('dialog');

  await modal.locator('.change-avatar-form__file-input').setInputFiles(pngFile);

  await expect(modal.getByText(pngFile.name)).toBeVisible();

  await modal.getByRole('button', { name: 'Change avatar' }).click();

  await expect(modal.getByText('Файл не выбран')).toBeVisible();
  await expect(modal).toBeVisible();

  const headerAvatar = page
    .getByRole('button', { name: `Avatar ${mockUser.first_name}` })
    .locator('img');

  // Идентификатор пользователя зависит от порядка тестов, важен префикс
  // резолва и путь из ответа бэкенда.
  await expect(headerAvatar).toHaveAttribute(
    'src',
    /^https:\/\/ya-praktikum\.tech\/api\/v2\/resources\/mock-avatars\/\d+\/avatar\.png$/,
  );
});

test('does not send an unsupported file format', async ({ page, request }) => {
  await signUpAndOpenProfile({ page, request }, 'mockUnsupportedAvatarLogin');

  const modal = page.getByRole('dialog');

  const avatarRequests: string[] = [];
  page.on('request', (pageRequest) => {
    if (pageRequest.url().includes('/user/profile/avatar')) {
      avatarRequests.push(pageRequest.url());
    }
  });

  await modal.locator('.change-avatar-form__file-input').setInputFiles(pdfFile);

  await modal.getByRole('button', { name: 'Change avatar' }).click();

  await expect(modal.getByText('Допустимые форматы')).toBeVisible();

  expect(avatarRequests).toHaveLength(0);
});

test('keeps the form open with the selected file when the backend rejects the change', async ({
  page,
  request,
}) => {
  await signUpAndOpenProfile({ page, request }, 'mockRejectedAvatarLogin');

  const modal = page.getByRole('dialog');

  await page.route('**/user/profile/avatar', (route) => {
    return route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({ reason: 'Avatar is too big' }),
    });
  });

  await modal.locator('.change-avatar-form__file-input').setInputFiles(pngFile);

  await modal.getByRole('button', { name: 'Change avatar' }).click();

  await expect(modal.getByText('Ошибка смены аватара: Avatar is too big')).toBeVisible();
  await expect(modal.getByText(pngFile.name)).toBeVisible();

  await expect(modal.getByRole('textbox', { name: 'First name' })).toHaveValue(mockUser.first_name);
});
