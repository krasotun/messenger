// PROTOTYPE: заглушка состава для сравнения вариантов исключения участника.
// Реальный состав дополняется выдуманными участниками, чтобы список не
// помещался без прокрутки; исключение ничего не шлет в API, а только убирает
// строку локально и показывает Уведомление.
import { computed, Signal, signal } from '@angular/core';

import { ChatUser } from '../../application/chat-user.type';

import { Notifier } from '@shared/notifications';

const FAKE_NAMES = [
  'Ivan Ivanov',
  'Maria Petrova',
  'Alexey Smirnov',
  'Olga Kuznetsova',
  'Dmitry Sokolov',
  'Anna Popova',
  'Sergey Lebedev',
  'Elena Kozlova',
];

export interface PrototypeMember extends ChatUser {
  isCurrentUser: boolean;
}

export class PrototypeMembers {
  private readonly _removedIds = signal<ReadonlySet<number>>(new Set());

  readonly members: Signal<PrototypeMember[]>;

  constructor(
    realUsers: Signal<ChatUser[]>,
    private readonly _currentUserId: Signal<number | null>,
    private readonly _notifier: Notifier,
  ) {
    this.members = computed(() => {
      const fakes: ChatUser[] = FAKE_NAMES.map((name, index) => ({
        id: -(index + 1),
        name,
        avatar: null,
      }));
      const removed = this._removedIds();

      return [...realUsers(), ...fakes]
        .filter(({ id }) => !removed.has(id))
        .map((user) => ({ ...user, isCurrentUser: user.id === this._currentUserId() }));
    });
  }

  remove(member: PrototypeMember): void {
    this._removedIds.update((ids) => new Set([...ids, member.id]));
    this._notifier.success('Remove member', `${member.name} removed`);
  }
}

export function fallbackLetter(name: string): string {
  return name.trim()[0]?.toUpperCase() ?? '';
}
