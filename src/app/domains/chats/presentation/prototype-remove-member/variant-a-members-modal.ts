// PROTOTYPE, вариант A: состав в модалке, подтверждение - второй шаг той же
// модалки, без второго окна поверх.
import { Component, inject, input, signal } from '@angular/core';

import { fallbackLetter, PrototypeMember, PrototypeMembers } from './prototype-members';

import { Avatar } from '@shared/ui/avatar/avatar';
import { Button } from '@shared/ui/button/button';
import { ModalRef } from '@shared/ui/modal/modal-ref';

@Component({
  selector: 'app-variant-a-members-modal',
  imports: [Avatar, Button],
  template: `
    @if (pending(); as member) {
      <div class="step">
        <p class="question">
          Remove <b>{{ member.name }}</b> from <b>{{ chatTitle() }}</b
          >? They can be added back later.
        </p>
        <div class="actions">
          <button type="button" appButton colorType="secondary" (click)="pending.set(null)">
            ← Back
          </button>
          <button type="button" appButton (click)="confirm(member)">Remove</button>
        </div>
      </div>
    } @else {
      <div class="count">{{ state().members().length }} members</div>
      <ul class="list">
        @for (member of state().members(); track member.id) {
          <li class="row">
            <app-avatar
              [label]="'Avatar ' + member.name"
              [imageUrl]="member.avatar"
              [fallbackText]="letter(member.name)"
              size="sm"
            ></app-avatar>
            <span class="name">
              {{ member.name }}
              @if (member.isCurrentUser) {
                <span class="you">(you)</span>
              }
            </span>
            @if (!member.isCurrentUser) {
              <button
                type="button"
                class="remove"
                [attr.aria-label]="'Remove ' + member.name"
                (click)="pending.set(member)"
              >
                Remove
              </button>
            }
          </li>
        }
      </ul>
      <div class="actions">
        <button type="button" appButton colorType="secondary" (click)="close()">Close</button>
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
      min-width: 360px;
    }
    .count {
      font-size: 13px;
      color: var(--color-text-muted);
      margin-bottom: 8px;
    }
    .list {
      margin: 0;
      padding: 0;
      list-style: none;
      max-height: 320px;
      overflow-y: auto;
    }
    .row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 4px;
      border-radius: 4px;
    }
    .row:hover {
      background: var(--color-surface-hover);
    }
    .name {
      flex-grow: 1;
      font-size: 14px;
    }
    .you {
      color: var(--color-text-muted);
    }
    .remove {
      border: 0;
      background: transparent;
      color: var(--color-danger);
      font: inherit;
      font-size: 13px;
      cursor: pointer;
    }
    .question {
      margin: 0 0 16px;
      font-size: 14px;
    }
    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 12px;
    }
  `,
})
export class VariantAMembersModal {
  readonly state = input.required<PrototypeMembers>();
  readonly chatTitle = input.required<string>();

  private readonly _modalRef = inject(ModalRef);

  protected readonly pending = signal<PrototypeMember | null>(null);

  protected readonly letter = fallbackLetter;

  protected confirm(member: PrototypeMember): void {
    this.state().remove(member);
    this.pending.set(null);
  }

  protected close(): void {
    this._modalRef.close();
  }
}
