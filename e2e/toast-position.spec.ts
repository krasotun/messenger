import test, { expect } from '@playwright/test';

const mockUser = {
  first_name: 'mockFirstName',
  second_name: 'mockSecondName',
  login: 'mockToastPositionLogin',
  email: 'mock-toast-position@email.email',
  password: 'mockPasswo@123rd',
  phone: '79999999999',
};

const chatTitle = 'mockToastPositionChatTitle';

const updatedFirstName = 'updatedFirstName';

test('shows the toast in the top-right corner after create chat closed the modal from a response callback', async ({
  page,
  request,
}) => {
  await request.post('http://localhost:3000/auth/signup', { data: mockUser });

  const { login, password } = mockUser;

  await page.context().request.post('http://localhost:3000/auth/signin', {
    data: { login, password },
  });

  await page.goto('/');

  await page.getByRole('button', { name: 'Create' }).click();

  const createChatModal = page.getByRole('dialog');

  await createChatModal.getByRole('textbox', { name: 'Title' }).fill(chatTitle);
  await createChatModal.getByRole('button', { name: 'Create' }).click();

  await expect(createChatModal).toBeHidden();
  await expect(page.getByText(chatTitle)).toBeVisible();

  await page.getByRole('button', { name: `Avatar ${mockUser.first_name}` }).click();
  await page.getByRole('button', { name: 'Edit profile' }).click();

  await page.getByRole('textbox', { name: 'First name' }).fill(updatedFirstName);
  await page.getByRole('button', { name: 'Save' }).click();

  const toast = page.locator('.app-toast').first();

  await expect(toast).toBeVisible();

  const viewportSize = page.viewportSize();
  const toastBox = await toast.boundingBox();

  if (!viewportSize || !toastBox) {
    throw new Error('Could not measure the toast or the viewport');
  }

  // Регрессия #143: закрытие модалки из effect роняло проход отрисовки, и
  // GlobalPositionStrategy не успевала применить позицию - уведомление
  // вставало у левого края вместо правого верхнего угла.
  expect(toastBox.x + toastBox.width).toBeGreaterThan(viewportSize.width / 2);
  expect(toastBox.y).toBeLessThan(viewportSize.height / 2);
});
