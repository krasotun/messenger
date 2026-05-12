import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignUpForm } from '../sign-up-form/sign-up-form';

import { SignUpPage } from './sign-up-page';

@Component({
  selector: 'app-sign-up-form',
  template: '',
})
class SignUpFormStub {}

describe('SignUp', () => {
  let component: SignUpPage;
  let fixture: ComponentFixture<SignUpPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignUpPage, SignUpFormStub],
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
});
