import test, { expect } from '@playwright/test';

const chatOwner = {
  first_name: 'ownerFirstName',
  second_name: 'mockSecondName',
  login: 'mockRemoveMemberOwnerLogin',
  email: 'mock-remove-member-owner@email.email',
  password: 'mockPasswo@123rd',
  phone: '79999999999',
};

const removedUser = {
  first_name: 'removedFirstName',
  second_name: 'mockSecondName',
  login: 'mockRemoveMemberRemovedLogin',
  email: 'mock-remove-member-removed@email.email',
  password: 'mockPasswo@123rd',
  phone: '79999999999',
};

const chatTitle = 'mockRemoveMemberChatTitle';

test('removes a member from the open members panel', async ({ page, request }) => {
  await request.post('http://localhost:3000/auth/signup', { data: chatOwner });

  const signupResponse = await request.post('http://localhost:3000/auth/signup', {
    data: removedUser,
  });
  const { id: removedUserId } = (await signupResponse.json()) as { id: number };

  const { login, password } = chatOwner;

  await page.context().request.post('http://localhost:3000/auth/signin', {
    data: { login, password },
  });

  // Чат и его состав заводятся прямыми запросами, а не через UI: иначе тест
  // повторяет create-chat.spec.ts и add-chat-user.spec.ts и падал бы по чужой
  // причине.
  const chatResponse = await page.context().request.post('http://localhost:3000/chats', {
    data: { title: chatTitle },
  });
  const { id: chatId } = (await chatResponse.json()) as { id: number };

  await page.context().request.put('http://localhost:3000/chats/users', {
    data: { users: [removedUserId], chatId },
  });

  await page.goto('/');

  await page.getByText(chatTitle).click();

  await page.locator('app-selected-chat-header app-chat-user-stack').click();

  const panel = page.locator('app-chat-users-panel');

  await expect(panel.getByText('Members · 2')).toBeVisible();

  await panel.getByRole('button', { name: `Remove ${removedUser.first_name}` }).click();

  const modal = page.getByRole('dialog');

  await expect(modal).toBeVisible();
  await expect(modal.getByText(removedUser.first_name)).toBeVisible();

  await modal.getByRole('button', { name: 'Remove', exact: true }).click();

  await expect(modal).toBeHidden();

  await expect(page.getByText('Member removed')).toBeVisible();
  await expect(panel.getByText('Members · 1')).toBeVisible();
  await expect(panel.getByText(removedUser.first_name)).toBeHidden();
});
