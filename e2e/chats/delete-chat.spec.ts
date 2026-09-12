import test, { expect } from '@playwright/test';

const chatOwner = {
  first_name: 'ownerFirstName',
  second_name: 'mockSecondName',
  login: 'mockDeleteChatOwnerLogin',
  email: 'mock-delete-chat-owner@email.email',
  password: 'mockPasswo@123rd',
  phone: '79999999999',
};

const chatTitle = 'mockDeletedChatTitle';

test('deletes the chat and drops it from the list', async ({ page, request }) => {
  await request.post('http://localhost:3000/auth/signup', { data: chatOwner });

  const { login, password } = chatOwner;

  await page.context().request.post('http://localhost:3000/auth/signin', {
    data: { login, password },
  });

  // Чат заводится прямым запросом, а не через UI: иначе тест повторяет
  // create-chat.spec.ts и падал бы по чужой причине.
  await page.context().request.post('http://localhost:3000/chats', {
    data: { title: chatTitle },
  });

  await page.goto('/');

  await page.getByText(chatTitle).click();

  const header = page.locator('app-selected-chat-header');

  await expect(header.getByText(chatTitle)).toBeVisible();

  await page.getByRole('button', { name: 'Delete chat' }).click();

  const modal = page.getByRole('dialog');

  await expect(modal).toBeVisible();
  await expect(modal.getByText(chatTitle)).toBeVisible();

  await modal.getByRole('button', { name: 'Delete', exact: true }).click();

  await expect(modal).toBeHidden();

  await expect(page.getByText('Chat deleted successfully')).toBeVisible();
  await expect(page).toHaveURL('/');
  await expect(page.getByText(chatTitle)).toBeHidden();
});
