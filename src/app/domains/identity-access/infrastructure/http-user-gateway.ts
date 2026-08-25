import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';

import { UpdateProfileInput } from '../application/update-profile/update-profile.input';
import { UpdateProfileResult } from '../application/update-profile/update-profile.result';
import { UserGateway } from '../application/user.gateway';

import { mapAuthError } from './auth-error.mapper';
import { currentUserMapper } from './current-session/current-user.mapper';
import { updateProfileRequestMapper } from './update-profile/update-profile-request.mapper';
import { UserApi } from './user.api';

@Injectable()
export class HttpUserGateway implements UserGateway {
  private readonly _userApi = inject(UserApi);

  updateProfile(updateProfileInput: UpdateProfileInput): Observable<UpdateProfileResult> {
    const updateProfileRequest = updateProfileRequestMapper(updateProfileInput);

    return this._userApi.updateProfile(updateProfileRequest).pipe(
      map((response) => {
        return {
          user: currentUserMapper(response),
        };
      }),
      catchError((error) => {
        return throwError(() => mapAuthError(error, 'Failed to update profile. Please try again.'));
      }),
    );
  }
}
