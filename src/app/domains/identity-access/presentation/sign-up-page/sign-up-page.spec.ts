import { Component, output } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { render, screen } from '@testing-library/angular/zoneless';
import { userEvent } from '@testing-library/user-event';

import { SignUpForm } from '../sign-up-form/sign-up-form';

import { SignUpPage } from './sign-up-page';

// Заглушка формы дает кнопку, которой тест сообщает об успешной отправке.
@Component({
  selector: 'app-sign-up-form',
  template: '<button type="button" (click)="signUpSucceeded.emit()">Sign up succeeded</button>',
})
class SignUpFormStub {
  readonly signUpSucceeded = output<void>();
}

@Component({
  selector: 'app-sign-in-page',
  template: '',
})
class SignInPageStub {}

describe('SignUp', () => {
  const renderPage = () =>
    render(SignUpPage, {
      providers: [provideRouter([{ path: 'sign-in', component: SignInPageStub }])],
      importOverrides: [{ replace: SignUpForm, with: SignUpFormStub }],
    });

  it('should create', async () => {
    const { fixture } = await renderPage();

    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('goToSignIn', () => {
    it('should navigate to sign-in page', async () => {
      const user = userEvent.setup();
      await renderPage();
      const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate');

      await user.click(screen.getByRole('button', { name: 'Sign up succeeded' }));

      expect(navigateSpy).toHaveBeenCalledWith(['sign-in']);
    });
  });
});
