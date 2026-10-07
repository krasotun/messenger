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

// Состав больше, чем помещается в панели: снимок проверяет и прокрутку списка
// под заголовком с числом.
const chatUsersPanelOwner = {
  ...mockUser,
  login: 'mockChatUsersPanelScreenshotLogin',
  email: 'mock-chat-users-panel-screenshot@email.email',
};

const chatUsersPanelMembers = Array.from({ length: 15 }, (_, index) => ({
  ...mockUser,
  first_name: `member${index + 1}`,
  login: `mockChatUsersPanelMember${index + 1}Login`,
  email: `mock-chat-users-panel-member-${index + 1}@email.email`,
}));

const chatUsersPanelChatTitle = 'mockChatUsersPanelChatTitle';

test('chat users panel @visual', async ({ page, request }) => {
  await request.post('http://localhost:3000/auth/signup', { data: chatUsersPanelOwner });

  const memberIds: number[] = [];

  for (const member of chatUsersPanelMembers) {
    const response = await request.post('http://localhost:3000/auth/signup', { data: member });
    const { id } = (await response.json()) as { id: number };

    memberIds.push(id);
  }

  const { login, password } = chatUsersPanelOwner;

  await page.context().request.post('http://localhost:3000/auth/signin', {
    data: { login, password },
  });

  const chatResponse = await page.context().request.post('http://localhost:3000/chats', {
    data: { title: chatUsersPanelChatTitle },
  });
  const { id: chatId } = (await chatResponse.json()) as { id: number };

  await page.context().request.put('http://localhost:3000/chats/users', {
    data: { users: memberIds, chatId },
  });

  await page.goto('/');

  await page.getByText(chatUsersPanelChatTitle).click();

  await page.locator('app-selected-chat-header app-chat-user-stack').click();

  const panel = page.locator('app-chat-users-panel');

  await expect(panel.getByText(`Members · ${chatUsersPanelMembers.length + 1}`)).toBeVisible();

  // Снимок окна не отличит прокрутку списка от выросшей страницы: нижние
  // строки обрезаны в обоих случаях. Поэтому прокрутка проверяется отдельно.
  const isListScrollable = await panel
    .getByRole('list')
    .evaluate((list) => list.scrollHeight > list.clientHeight);

  expect(isListScrollable).toBe(true);

  await expect(page).toHaveScreenshot('chat-users-panel.png', { maxDiffPixels: 2000 });
});
