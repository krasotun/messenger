import { Component } from '@angular/core';
import { render } from '@testing-library/angular/zoneless';

import { Header } from '../header/header';

import { AuthenticatedShell } from './authenticated-shell';

@Component({
  selector: 'app-header',
  template: '',
})
class HeaderStub {}

describe('AuthenticatedShell', () => {
  it('should create', async () => {
    const { fixture } = await render(AuthenticatedShell, {
      importOverrides: [{ replace: Header, with: HeaderStub }],
      waitForStableOnRender: true,
    });

    expect(fixture.componentInstance).toBeTruthy();
  });
});
