import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { CurrentSessionService } from '@app/domains/identity-access/application/current-session/current-session.service';

@Component({
  selector: 'app-home-page',
  imports: [],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {
  private readonly _currentSessionService = inject(CurrentSessionService);
  private readonly _router = inject(Router);

  protected logout(): void {
    this._currentSessionService.logout().subscribe({
      next: () => {
        this._router.navigateByUrl('/sign-in');
      },
      error: () => {
        this._router.navigateByUrl('/sign-in');
      },
    });
  }
}
