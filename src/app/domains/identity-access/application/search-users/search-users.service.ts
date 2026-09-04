import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { USER_GATEWAY } from '../user.gateway';

import { SearchUsersInput } from './search-users.input';
import { SearchUsersResult } from './search-users.result';

@Injectable({
  providedIn: 'root',
})
export class SearchUsersService {
  private readonly _userGateway = inject(USER_GATEWAY);

  // Состояние поиска здесь не живет: ввод, задержка и отмена предыдущего
  // запроса - забота вызывающего экрана, а не use case.
  searchUsers(searchUsersInput: SearchUsersInput): Observable<SearchUsersResult> {
    return this._userGateway.searchUsers(searchUsersInput);
  }
}
