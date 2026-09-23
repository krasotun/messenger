// PROTOTYPE, вариант C: состав занимает место переписки под шапкой, как
// экран «о чате». Подтверждение - прямо в строке, без модалки.
import { Component, input, output, signal } from '@angular/core';

import { fallbackLetter, PrototypeMember, PrototypeMembers } from './prototype-members';

import { Avatar } from '@shared/ui/avatar/avatar';
import { Button } from '@shared/ui/button/button';

@Component({
  selector: 'app-variant-c-members-view',
  imports: [Avatar, Button],
  template: `
    <div class="head">
      <button type="button" appButton colorType="secondary" (click)="closed.emit()">
        ← Back to chat
      </button>
      <span class="title">{{ chatTitle() }} · {{ state().members().length }} members</span>
    </div>
    <ul class="list">
      @for (member of state().members(); track member.id) {
        <li class="row" [class.row_pending]="pending()?.id === member.id">
          <app-avatar
            [label]="'Avatar ' + member.name"
            [imageUrl]="member.avatar"
            [fallbackText]="letter(member.name)"
          ></app-avatar>
          @if (pending()?.id === member.id) {
            <span class="name"
              >Remove <b>{{ member.name }}</b> from this chat?</span
            >
            <button type="button" appButton colorType="secondary" (click)="pending.set(null)">
              Cancel
            </button>
            <button type="button" appButton colorType="danger" (click)="confirm(member)">
              Remove
            </button>
          } @else {
            <span class="name">
              {{ member.name }}
              @if (member.isCurrentUser) {
                <span class="you">(you)</span>
              }
            </span>
            @if (!member.isCurrentUser) {
              <button
                type="button"
                appButton
                colorType="secondary"
                [attr.aria-label]="'Remove ' + member.name"
                (click)="pending.set(member)"
              >
                Remove
              </button>
            }
          }
        </li>
      }
    </ul>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      box-sizing: border-box;
      background: var(--color-surface-softer);
    }
    .head {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 24px;
    }
    .title {
      font-weight: 600;
      font-size: 15px;
    }
    .list {
      margin: 0 24px 24px;
      padding: 0;
      list-style: none;
      overflow-y: auto;
      max-width: 640px;
      border: 1px solid var(--color-border-muted);
      border-radius: 8px;
      background: var(--color-surface);
    }
    .row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      border-bottom: 1px solid var(--color-border-muted);
    }
    .row:last-child {
      border-bottom: 0;
    }
    .row_pending {
      background: #fdecec;
    }
    .name {
      flex-grow: 1;
      font-size: 14px;
    }
    .you {
      color: var(--color-text-muted);
    }
  `,
})
export class VariantCMembersView {
  readonly state = input.required<PrototypeMembers>();
  readonly chatTitle = input.required<string>();
  readonly closed = output();

  protected readonly pending = signal<PrototypeMember | null>(null);

  protected readonly letter = fallbackLetter;

  protected confirm(member: PrototypeMember): void {
    this.state().remove(member);
    this.pending.set(null);
  }
}
