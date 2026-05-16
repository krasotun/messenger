import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignInForm } from '../sign-in-form/sign-in-form';

import { SignInPage } from './sign-in-page';

@Component({
  selector: 'app-sign-in-form',
  template: '',
})
class SignInFormStub {}

describe('SignIn', () => {
  let component: SignInPage;
  let fixture: ComponentFixture<SignInPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignInPage],
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
});
