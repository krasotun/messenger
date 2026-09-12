import test, { expect } from '@playwright/test';

const mockUser = {
  first_name: 'mockFirstName',
  second_name: 'mockSecondName',
  login: 'mockChatsScreenshotLogin',
  email: 'mock-chats-screenshot@email.email',
  password: 'mockPasswo@123rd',
  phone: '79999999999',
};

// Владелец чата отдельный: чат живет до конца прогона, а снимок пустого
// экрана выше ждет «No chats yet».
const confirmationUser = {
  ...mockUser,
  login: 'mockDeleteConfirmationScreenshotLogin',
  email: 'mock-delete-confirmation-screenshot@email.email',
};

const chatTitle = 'mockConfirmedChatTitle';

test('chats screen @visual', async ({ page, request }) => {
  await request.post('http://localhost:3000/auth/signup', { data: mockUser });

  const { login, password } = mockUser;

  await page.context().request.post('http://localhost:3000/auth/signin', {
    data: { login, password },
  });

  await page.goto('/');

  await expect(page.getByText('No chats yet')).toBeVisible();
  await expect(page.getByText('Select a chat to see it here')).toBeVisible();

  await expect(page).toHaveScreenshot('chats-screen.png', { maxDiffPixels: 2000 });
});

test('delete chat confirmation @visual', async ({ page, request }) => {
  await request.post('http://localhost:3000/auth/signup', { data: confirmationUser });

  const { login, password } = confirmationUser;

  await page.context().request.post('http://localhost:3000/auth/signin', {
    data: { login, password },
  });

  await page.context().request.post('http://localhost:3000/chats', {
    data: { title: chatTitle },
  });

  await page.goto('/');

  await page.getByText(chatTitle).click();

  await page.getByRole('button', { name: 'Delete chat' }).click();

  const modal = page.getByRole('dialog');

  await expect(modal).toBeVisible();
  await expect(modal.getByRole('button', { name: 'Delete', exact: true })).toBeVisible();

  await expect(page).toHaveScreenshot('delete-chat-confirmation.png', { maxDiffPixels: 2000 });
});
