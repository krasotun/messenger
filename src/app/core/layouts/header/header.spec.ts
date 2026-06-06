import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Header } from './header';

import { CurrentUserAvatarMenu } from '@app/domains/identity-access/presentation/current-user-avatar-menu/current-user-avatar-menu';

@Component({
  selector: 'app-current-user-avatar-menu',
  template: '',
})
class CurrentUserAvatarMenuStub {}

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
    })
      .overrideComponent(Header, {
        remove: {
          imports: [CurrentUserAvatarMenu],
        },
        add: {
          imports: [CurrentUserAvatarMenuStub],
        },
      })

      .compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
