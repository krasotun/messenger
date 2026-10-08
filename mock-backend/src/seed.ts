import {
  Chat,
  chatsById,
  chatUserIdsByChatId,
  nextChatId,
  nextUserId,
  User,
  usersByLogin,
} from './store';

// Пароль у всех демо-пользователей один: данные только для ручной проверки на моке.
export const demoPassword = 'Password123';

const demoUsers = [
  { login: 'marat', first_name: 'Marat', second_name: 'Ibragimov' },
  { login: 'boris', first_name: 'Boris', second_name: 'Petrov' },
  { login: 'anna', first_name: 'Anna', second_name: 'Smirnova' },
  { login: 'ivan', first_name: 'Ivan', second_name: 'Sidorov' },
  { login: 'olga', first_name: 'Olga', second_name: 'Kuznetsova' },
];

// Первый логин - создатель чата. Чат boris нужен, чтобы видеть экран не-создателя.
const demoChats = [
  { title: 'Frontend team', logins: ['marat', 'boris', 'anna'] },
  { title: 'Backend team', logins: ['boris', 'marat', 'ivan'] },
  { title: 'Family', logins: ['marat', 'olga'] },
  { title: 'Notes to self', logins: ['marat'] },
];

export function seedDemoData(): void {
  for (const demoUser of demoUsers) {
    const user: User = {
      id: nextUserId(),
      ...demoUser,
      display_name: null,
      email: `${demoUser.login}@example.com`,
      password: demoPassword,
      phone: '+79990000000',
      avatar: null,
    };

    usersByLogin.set(user.login, user);
  }

  for (const demoChat of demoChats) {
    const userIds = demoChat.logins.map((login) => usersByLogin.get(login)!.id);

    const chat: Chat = {
      id: nextChatId(),
      title: demoChat.title,
      avatar: null,
      createdBy: userIds[0],
    };

    chatsById.set(chat.id, chat);
    chatUserIdsByChatId.set(chat.id, new Set(userIds));
  }
}
