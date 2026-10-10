import { Component, output } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { render, screen } from '@testing-library/angular/zoneless';
import { userEvent } from '@testing-library/user-event';

import { SignInForm } from '../sign-in-form/sign-in-form';

import { SignInPage } from './sign-in-page';

// Заглушка формы дает кнопку, которой тест сообщает об успешной отправке.
@Component({
  selector: 'app-sign-in-form',
  template: '<button type="button" (click)="signInSucceeded.emit()">Sign in succeeded</button>',
})
class SignInFormStub {
  readonly signInSucceeded = output<void>();
}

@Component({
  selector: 'app-home-page',
  template: '',
})
class HomePageStub {}

describe('SignIn', () => {
  const renderPage = () =>
    render(SignInPage, {
      providers: [provideRouter([{ path: '', component: HomePageStub }])],
      importOverrides: [{ replace: SignInForm, with: SignInFormStub }],
    });

  it('should create', async () => {
    const { fixture } = await renderPage();

    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('goToHome', () => {
    it('should navigate to home page', async () => {
      const user = userEvent.setup();
      await renderPage();
      const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate');

      await user.click(screen.getByRole('button', { name: 'Sign in succeeded' }));

      expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });
  });
});
