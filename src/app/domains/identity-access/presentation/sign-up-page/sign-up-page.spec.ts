import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignUpPage } from './sign-up-page';

import { API_BASE_URL } from '@app/core/tokens';

const baseUrlMock = 'baseUrlMock';

describe('SignUp', () => {
  let component: SignUpPage;
  let fixture: ComponentFixture<SignUpPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignUpPage],
      providers: [
        {
          provide: API_BASE_URL,
          useValue: baseUrlMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SignUpPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
