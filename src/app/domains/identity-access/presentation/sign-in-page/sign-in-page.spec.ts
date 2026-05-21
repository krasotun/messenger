import { Component, output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';

import { SignInForm } from '../sign-in-form/sign-in-form';

import { SignInPage } from './sign-in-page';

@Component({
  selector: 'app-sign-in-form',
  template: '',
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
  let component: SignInPage;
  let fixture: ComponentFixture<SignInPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignInPage],
      providers: [provideRouter([{ path: '', component: HomePageStub }])],
    })
      .overrideComponent(SignInPage, {
        remove: {
          imports: [SignInForm],
        },
        add: {
          imports: [SignInFormStub],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(SignInPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('goToHome', () => {
    it('should navigate to home page', () => {
      const router = TestBed.inject(Router);
      const navigateSpy = vi.spyOn(router, 'navigate');

      const signInForm = fixture.debugElement.query(By.directive(SignInFormStub))
        .componentInstance as SignInFormStub;
      signInForm.signInSucceeded.emit();

      expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });
  });
});
