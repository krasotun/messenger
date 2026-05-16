import { Component, output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';

import { SignUpForm } from '../sign-up-form/sign-up-form';

import { SignUpPage } from './sign-up-page';

@Component({
  selector: 'app-sign-up-form',
  template: '',
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
  let component: SignUpPage;
  let fixture: ComponentFixture<SignUpPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignUpPage, SignUpFormStub],
      providers: [provideRouter([{ path: 'sign-in', component: SignInPageStub }])],
    })
      .overrideComponent(SignUpPage, {
        remove: {
          imports: [SignUpForm],
        },
        add: {
          imports: [SignUpFormStub],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(SignUpPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('goToSignIn', () => {
    it('should navigate to sign-in page', () => {
      const router = TestBed.inject(Router);
      const navigateSpy = vi.spyOn(router, 'navigate');

      const signUpForm = fixture.debugElement.query(By.directive(SignUpFormStub))
        .componentInstance as SignUpFormStub;
      signUpForm.signUpSucceeded.emit();

      expect(navigateSpy).toHaveBeenCalledWith(['sign-in']);
    });
  });
});
