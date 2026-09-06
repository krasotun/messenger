import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { USER_GATEWAY } from '../user.gateway';
import { User } from '../user.type';

import { SearchUsersResult } from './search-users-result.type';
import { SearchUsersService } from './search-users.service';

import { ApplicationError } from '@shared/errors';

const userGatewayMock = {
  searchUsers: vi.fn(),
};

const userMock: User = {
  id: 2,
  login: 'jane.roe',
  name: 'Janie',
  avatar: null,
};

describe('SearchUsersService', () => {
  let service: SearchUsersService;

  beforeEach(() => {
    userGatewayMock.searchUsers.mockReset();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: USER_GATEWAY,
          useValue: userGatewayMock,
        },
        SearchUsersService,
      ],
    });

    service = TestBed.inject(SearchUsersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('searchUsers', () => {
    it('should ask the user gateway for the given login', () => {
      userGatewayMock.searchUsers.mockReturnValue(of({ users: [userMock] }));

      service.searchUsers({ login: 'jane' }).subscribe();

      expect(userGatewayMock.searchUsers).toHaveBeenCalledOnce();
      expect(userGatewayMock.searchUsers).toHaveBeenCalledWith({ login: 'jane' });
    });

    describe('when users are found', () => {
      it('should emit the found users', () => {
        userGatewayMock.searchUsers.mockReturnValue(of({ users: [userMock] }));

        const results: SearchUsersResult[] = [];

        service.searchUsers({ login: 'jane' }).subscribe((result) => {
          results.push(result);
        });

        expect(results).toEqual([{ users: [userMock] }]);
      });
    });

    describe('when nobody matches', () => {
      it('should emit an empty result instead of an error', () => {
        userGatewayMock.searchUsers.mockReturnValue(of({ users: [] }));

        const results: SearchUsersResult[] = [];
        const errors: ApplicationError[] = [];

        service.searchUsers({ login: 'nobody' }).subscribe({
          next: (result) => {
            results.push(result);
          },
          error: (applicationError: ApplicationError) => {
            errors.push(applicationError);
          },
        });

        expect(results).toEqual([{ users: [] }]);
        expect(errors).toHaveLength(0);
      });
    });

    describe('when the search fails', () => {
      it('should emit the application error', () => {
        userGatewayMock.searchUsers.mockReturnValue(
          throwError(() => new ApplicationError('mockReason')),
        );

        const errors: ApplicationError[] = [];

        service.searchUsers({ login: 'jane' }).subscribe({
          error: (applicationError: ApplicationError) => {
            errors.push(applicationError);
          },
        });

        expect(errors).toHaveLength(1);
        expect(errors[0]).toBeInstanceOf(ApplicationError);
        expect(errors[0].message).toBe('mockReason');
      });
    });
  });
});
