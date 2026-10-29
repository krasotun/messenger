import { Component, computed, inject, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { createUserSearchState } from './user-search-state';
import { UserSearchStatus } from './user-search-status';

import { ChatUsersStore } from '@domains/chats/data/chat-users-store';
import { SearchUsersService, User } from '@domains/users';
import { Nullable } from '@shared/types';
import { Avatar } from '@shared/ui/avatar/avatar';
import { Input } from '@shared/ui/input/input';

const notStartedHint = 'Start typing a login';
const nobodyFoundHint = 'No users found';

@Component({
  selector: 'app-add-chat-user-panel',
  imports: [Avatar, Input, ReactiveFormsModule],
  templateUrl: './add-chat-user-panel.html',
  styleUrl: './add-chat-user-panel.scss',
})
export class AddChatUserPanel {
  readonly chatId = input.required<number>();

  readonly userAdded = output<void>();

  readonly loginControl = new FormControl('', { nonNullable: true });

  private readonly _searchUsersService = inject(SearchUsersService);
  private readonly _chatUsersStore = inject(ChatUsersStore);

  private readonly _userSearchState = createUserSearchState(
    this._searchUsersService,
    this.loginControl.valueChanges,
  );

  private readonly _searchResult = this._userSearchState.result;

  protected readonly foundUsers = computed<User[]>(() => {
    const result = this._searchResult();

    return result.status === UserSearchStatus.Found ? result.users : [];
  });

  protected readonly hintText = computed<Nullable<string>>(() => {
    switch (this._searchResult().status) {
      case UserSearchStatus.NotStarted:
        return notStartedHint;
      case UserSearchStatus.NobodyFound:
        return nobodyFoundHint;
      default:
        return null;
    }
  });

  constructor() {
    // Успешное добавление закрывает всю панель, а не только очищает список:
    // добавленный участник виден в шапке, отдельного сообщения об успехе нет.
    this._chatUsersStore.chatUserAdditionFlow.succeeded$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.userAdded.emit();
      });
  }

  protected addUser(user: User): void {
    this._chatUsersStore.addChatUser({ chatId: this.chatId(), userId: user.id });
  }
}
