import { Component, computed, effect, inject, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { AddChatUserStatus } from '../../application/add-chat-user/add-chat-user-status.type';
import { AddChatUserService } from '../../application/add-chat-user/add-chat-user.service';
import { UserSearchStatus } from '../../application/user-search/user-search-status.type';
import { createUserSearchState } from '../../application/user-search/user-search.state';

import { SearchUsersService, User } from '@domains/identity-access';
import { Nullable } from '@shared/types';
import { Avatar } from '@shared/ui/avatar/avatar';
import { Input } from '@shared/ui/input/input';

const notStartedHint = 'Начните вводить логин';
const nobodyFoundHint = 'Никого не нашли';

@Component({
  selector: 'app-add-chat-user-panel',
  imports: [Avatar, Input, ReactiveFormsModule],
  templateUrl: './add-chat-user-panel.html',
  styleUrl: './add-chat-user-panel.scss',
  providers: [AddChatUserService],
})
export class AddChatUserPanel {
  readonly chatId = input.required<number>();

  readonly userAdded = output<void>();

  readonly loginControl = new FormControl('', { nonNullable: true });

  private readonly _searchUsersService = inject(SearchUsersService);
  private readonly _addChatUserService = inject(AddChatUserService);

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

  protected readonly errorMessage = this._addChatUserService.errorMessage;

  constructor() {
    // Успешное добавление закрывает всю панель, а не только очищает список:
    // добавленный участник виден в шапке, отдельного сообщения об успехе нет.
    effect(() => {
      if (this._addChatUserService.status() === AddChatUserStatus.Success) {
        this.userAdded.emit();
      }
    });
  }

  protected addUser(user: User): void {
    this._addChatUserService.addChatUser({ chatId: this.chatId(), userId: user.id });
  }

  protected avatarFallbackText(user: User): string {
    return user.name.trim()[0]?.toUpperCase() ?? '';
  }
}
