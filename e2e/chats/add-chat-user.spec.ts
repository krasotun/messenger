import test, { expect } from '@playwright/test';

const chatOwner = {
  first_name: 'ownerFirstName',
  second_name: 'mockSecondName',
  login: 'mockAddMemberOwnerLogin',
  email: 'mock-add-member-owner@email.email',
  password: 'mockPasswo@123rd',
  phone: '79999999999',
};

const invitedUser = {
  first_name: 'invitedFirstName',
  second_name: 'mockSecondName',
  login: 'mockAddMemberInvitedLogin',
  email: 'mock-add-member-invited@email.email',
  password: 'mockPasswo@123rd',
  phone: '79999999999',
};

const chatTitle = 'mockAddMemberChatTitle';

test('adds a found user to the chat and shows them in the header', async ({ page, request }) => {
  await request.post('http://localhost:3000/auth/signup', { data: chatOwner });
  await request.post('http://localhost:3000/auth/signup', { data: invitedUser });

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
  await expect(header.getByRole('img', { name: `Avatar ${invitedUser.first_name}` })).toBeHidden();

  await page.getByRole('button', { name: 'Add member' }).click();

  await page.getByRole('textbox', { name: 'Поиск пользователя' }).fill(invitedUser.login);

  await page.getByRole('button', { name: invitedUser.first_name }).click();

  await expect(header.getByRole('img', { name: `Avatar ${invitedUser.first_name}` })).toBeVisible();
});
