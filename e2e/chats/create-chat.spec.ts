import test, { expect } from '@playwright/test';

const mockUser = {
  first_name: 'mockFirstName',
  second_name: 'mockSecondName',
  login: 'mockCreateChatLogin',
  email: 'mock-create-chat@email.email',
  password: 'mockPasswo@123rd',
  phone: '79999999999',
};

const chatTitle = 'mockCreatedChatTitle';

test('creates a chat and shows it in the list', async ({ page, request }) => {
  await request.post('http://localhost:3000/auth/signup', { data: mockUser });

  const { login, password } = mockUser;

  await page.context().request.post('http://localhost:3000/auth/signin', {
    data: { login, password },
  });

  await page.goto('/');

  await expect(page.getByText('No chats yet')).toBeVisible();

  await page.getByRole('button', { name: 'Create' }).click();

  const modal = page.getByRole('dialog');

  await expect(modal).toBeVisible();

  await modal.getByRole('textbox', { name: 'Title' }).fill(chatTitle);
  await modal.getByRole('button', { name: 'Create' }).click();

  await expect(modal).toBeHidden();

  await expect(page.getByText(chatTitle)).toBeVisible();
  await expect(page.getByText('No chats yet')).toBeHidden();
});
