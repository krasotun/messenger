import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
})
export class App {
  private readonly _router = inject(Router);

  protected navigateToMainPage() {
    this._router.navigate(['']);
  }

  protected navigateToSignInPage(): void {
    this._router.navigate(['sign-in']);
  }

  protected navigateToSignUpPage() {
    this._router.navigate(['sign-up']);
  }
}
