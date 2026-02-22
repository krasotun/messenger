import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly _router = inject(Router);

  protected navigateToSignInPage(): void {
    this._router.navigate(['sign-in']);
  }

  protected navigateToSignUpPage() {
    this._router.navigate(['sign-up']);
  }
}
