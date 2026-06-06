import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Header } from '../header/header';

import { AuthenticatedShell } from './authenticated-shell';

@Component({
  selector: 'app-header',
  template: '',
})
class HeaderStub {}

describe('AuthenticatedShell', () => {
  let component: AuthenticatedShell;
  let fixture: ComponentFixture<AuthenticatedShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthenticatedShell],
    })
      .overrideComponent(AuthenticatedShell, {
        remove: {
          imports: [Header],
        },
        add: {
          imports: [HeaderStub],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AuthenticatedShell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
