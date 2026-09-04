import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatUser } from '../../application/chat-user';

import { ChatUserStack } from './chat-user-stack';

const buildUsers = (count: number): ChatUser[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `User ${index + 1}`,
    avatar: null,
  }));
};

describe('ChatUserStack', () => {
  let fixture: ComponentFixture<ChatUserStack>;

  const createComponent = async (users: ChatUser[]): Promise<void> => {
    fixture = TestBed.createComponent(ChatUserStack);
    fixture.componentRef.setInput('users', users);
    await fixture.whenStable();
    fixture.detectChanges();
  };

  it('should create', async () => {
    await createComponent([]);

    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('when members fit', () => {
    it('should show avatars for all members and no rest count', async () => {
      await createComponent(buildUsers(3));

      expect(fixture.nativeElement.querySelectorAll('app-avatar')).toHaveLength(3);
      expect(fixture.nativeElement.querySelector('.chat-user-stack__rest')).toBeNull();
    });
  });

  describe('when there are more members than fit', () => {
    it('should show a limited number of avatars and the rest count', async () => {
      await createComponent(buildUsers(6));

      expect(fixture.nativeElement.querySelectorAll('app-avatar')).toHaveLength(4);
      expect(fixture.nativeElement.querySelector('.chat-user-stack__rest').textContent).toBe('+2');
    });

    it('should not react to a click on the rest count', async () => {
      await createComponent(buildUsers(6));

      const restElement: HTMLElement =
        fixture.nativeElement.querySelector('.chat-user-stack__rest');

      expect(restElement.tagName).toBe('SPAN');
      expect(() => restElement.click()).not.toThrow();
    });
  });
});
