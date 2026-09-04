import { Component, computed, DestroyRef, effect, inject, input, output } from '@angular/core';

import { AddChatUserStatus } from '../../application/add-chat-user/add-chat-user-status';
import { AddChatUserService } from '../../application/add-chat-user/add-chat-user.service';
import { UserSearchStatus } from '../../application/user-search/user-search-status';
import { createUserSearchState } from '../../application/user-search/user-search.state';

import { SearchUsersService, User } from '@domains/identity-access';
import { Avatar } from '@shared/ui/avatar/avatar';
import { Input } from '@shared/ui/input/input';

@Component({
  selector: 'app-add-chat-user-panel',
  imports: [Avatar, Input],
  templateUrl: './add-chat-user-panel.html',
  styleUrl: './add-chat-user-panel.scss',
  providers: [AddChatUserService],
})
export class AddChatUserPanel {
  readonly chatId = input.required<number>();

  readonly userAdded = output<void>();

  private readonly _searchUsersService = inject(SearchUsersService);
  private readonly _addChatUserService = inject(AddChatUserService);

  private readonly _userSearchState = createUserSearchState(this._searchUsersService);

  protected readonly foundUsers = this._userSearchState.users;
  protected readonly isNotStarted = computed(
    () => this._userSearchState.status() === UserSearchStatus.NotStarted,
  );
  protected readonly isEmptyResult = computed(
    () => this._userSearchState.status() === UserSearchStatus.Empty,
  );

  protected readonly errorMessage = this._addChatUserService.errorMessage;

  constructor() {
    inject(DestroyRef).onDestroy(() => this._userSearchState.destroy());

    // Успешное добавление закрывает всю панель, а не только очищает список:
    // добавленный участник виден в шапке, отдельного сообщения об успехе нет.
    effect(() => {
      if (this._addChatUserService.status() === AddChatUserStatus.Success) {
        this.userAdded.emit();
      }
    });
  }

  protected onQueryInput(event: Event): void {
    const login = (event.target as HTMLInputElement).value;

    this._userSearchState.search(login);
  }

  protected addUser(user: User): void {
    this._addChatUserService.addChatUser({ chatId: this.chatId(), userId: user.id });
  }

  protected avatarFallbackText(user: User): string {
    return user.name.trim()[0]?.toUpperCase() ?? '';
  }
}
