// PROTOTYPE, вариант B: состав в боковой панели справа. Панель - не оверлей,
// поэтому обычное окно подтверждения открывается поверх и ее не закрывает.
import { Component, inject, input, output } from '@angular/core';

import { fallbackLetter, PrototypeMember, PrototypeMembers } from './prototype-members';

import { Avatar } from '@shared/ui/avatar/avatar';
import { ConfirmationService } from '@shared/ui/confirmation';

@Component({
  selector: 'app-variant-b-side-panel',
  imports: [Avatar],
  template: `
    <div class="head">
      <span class="title">Members · {{ state().members().length }}</span>
      <button type="button" class="close" aria-label="Close members" (click)="closed.emit()">
        ✕
      </button>
    </div>
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
              (click)="remove(member)"
            >
              ✕
            </button>
          }
        </li>
      }
    </ul>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      width: 300px;
      height: 100%;
      box-sizing: border-box;
      border-left: 1px solid var(--color-border-muted);
      background: var(--color-surface);
    }
    .head {
      display: flex;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid var(--color-border-muted);
    }
    .title {
      flex-grow: 1;
      font-weight: 600;
      font-size: 14px;
    }
    .close,
    .remove {
      border: 0;
      background: transparent;
      color: var(--color-icon);
      cursor: pointer;
      font-size: 14px;
    }
    .list {
      margin: 0;
      padding: 8px;
      list-style: none;
      overflow-y: auto;
      flex-grow: 1;
    }
    .row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 8px;
      border-radius: 4px;
    }
    .row:hover {
      background: var(--color-surface-hover);
    }
    .remove {
      visibility: hidden;
    }
    .row:hover .remove,
    .remove:focus-visible {
      visibility: visible;
      color: var(--color-danger);
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
export class VariantBSidePanel {
  readonly state = input.required<PrototypeMembers>();
  readonly chatTitle = input.required<string>();
  readonly closed = output();

  private readonly _confirmationService = inject(ConfirmationService);

  protected readonly letter = fallbackLetter;

  protected remove(member: PrototypeMember): void {
    this._confirmationService
      .confirm({
        title: 'Remove member',
        subject: member.name,
        message: `They leave "${this.chatTitle()}" and can be added back later.`,
        confirmLabel: 'Remove',
      })
      .subscribe((confirmed) => {
        if (confirmed) {
          this.state().remove(member);
        }
      });
  }
}
