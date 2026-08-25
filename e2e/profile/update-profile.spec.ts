import test, { expect } from '@playwright/test';

const mockUser = {
  first_name: 'mockFirstName',
  second_name: 'mockSecondName',
  login: 'mockUpdateProfileLogin',
  email: 'mock-update-profile@email.email',
  password: 'mockPasswo@123rd',
  phone: '79999999999',
};

const updatedFirstName = 'updatedFirstName';

test('shows updated profile data without page reload', async ({ page, request }) => {
  await request.post('http://localhost:3000/auth/signup', { data: mockUser });

  const { login, password } = mockUser;

  await page.context().request.post('http://localhost:3000/auth/signin', {
    data: { login, password },
  });

  await page.goto('/');

  await page.getByRole('button', { name: `Avatar ${mockUser.first_name}` }).click();
  await page.getByRole('button', { name: 'Edit profile' }).click();

  await page.getByRole('textbox', { name: 'First name' }).fill(updatedFirstName);

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByRole('dialog')).toBeHidden();

  await expect(page.getByRole('button', { name: `Avatar ${updatedFirstName}` })).toBeVisible();
});

test('keeps entered values and shows an error when the backend rejects saving', async ({
  page,
  request,
}) => {
  const takenLoginUser = { ...mockUser, login: 'mockTakenLogin', email: 'mock-taken@email.email' };

  await request.post('http://localhost:3000/auth/signup', { data: takenLoginUser });

  const rejectedUser = {
    ...mockUser,
    login: 'mockRejectedUpdateLogin',
    email: 'mock-rejected-update@email.email',
  };

  await request.post('http://localhost:3000/auth/signup', { data: rejectedUser });

  await page.context().request.post('http://localhost:3000/auth/signin', {
    data: { login: rejectedUser.login, password: rejectedUser.password },
  });

  await page.goto('/');

  await page.getByRole('button', { name: `Avatar ${rejectedUser.first_name}` }).click();
  await page.getByRole('button', { name: 'Edit profile' }).click();

  await page.getByRole('textbox', { name: 'Login' }).fill(takenLoginUser.login);

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Ошибка сохранения: Login already exists')).toBeVisible();

  await expect(page.getByRole('textbox', { name: 'Login' })).toHaveValue(takenLoginUser.login);
});
