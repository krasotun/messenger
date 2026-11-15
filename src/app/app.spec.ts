import { render } from '@testing-library/angular/zoneless';
import { MessageService } from 'primeng/api';

import { App } from './app';

describe('App', () => {
  it('should create the app', async () => {
    const { fixture } = await render(App, {
      providers: [MessageService],
      skipDetectChanges: true,
    });

    expect(fixture.componentInstance).toBeTruthy();
  });
});
