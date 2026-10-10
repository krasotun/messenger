import { Component } from '@angular/core';
import { render } from '@testing-library/angular/zoneless';

import { Header } from './header';

import { CurrentUserAvatarMenu } from '@domains/identity-access';

@Component({
  selector: 'app-current-user-avatar-menu',
  template: '',
})
class CurrentUserAvatarMenuStub {}

describe('Header', () => {
  it('should create', async () => {
    const { fixture } = await render(Header, {
      importOverrides: [{ replace: CurrentUserAvatarMenu, with: CurrentUserAvatarMenuStub }],
      waitForStableOnRender: true,
    });

    expect(fixture.componentInstance).toBeTruthy();
  });
});
