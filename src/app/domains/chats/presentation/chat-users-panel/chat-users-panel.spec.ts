import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatUsersPanel } from './chat-users-panel';

describe('ChatUsersPanel', () => {
  let component: ChatUsersPanel;
  let fixture: ComponentFixture<ChatUsersPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatUsersPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatUsersPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it.todo('will be later', () => {
    expect(1).toBe(2);
  });
});
