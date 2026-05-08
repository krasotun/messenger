import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignUpService, SignUpStatus } from '../../application/sign-up.service';

import { SignUpForm } from './sign-up-form';

const signUpServiceMock = {
  isSubmitting: signal(false),
  errorMessage: signal(null),
  status: signal(SignUpStatus.Idle),
};

describe('SignUpForm', () => {
  let component: SignUpForm;
  let fixture: ComponentFixture<SignUpForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignUpForm],
      providers: [
        {
          provide: SignUpService,
          useValue: signUpServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SignUpForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
