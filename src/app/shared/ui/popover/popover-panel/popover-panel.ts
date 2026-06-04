import { NgTemplateOutlet } from '@angular/common';
import { Component, input, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-popover-panel',
  imports: [NgTemplateOutlet],
  templateUrl: './popover-panel.html',
  styleUrl: './popover-panel.scss',
})
export class PopoverPanel {
  readonly content = input.required<TemplateRef<unknown>>();
}
