import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, RouterLink],
  template: `
    <div
      style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 70vh; text-align: center;"
    >
      <mat-icon
        style="font-size: 96px; width: 96px; height: 96px; color: var(--mat-sys-error, #ba1a1a); margin-bottom: 24px;"
        >error_outline</mat-icon
      >
      <h1 style="font-size: 3rem; margin-bottom: 8px; font-weight: 500;">404 - Page Not Found</h1>
      <p
        style="font-size: 1.2rem; color: var(--mat-sys-on-surface-variant, #5f6368); margin-bottom: 24px; max-width: 500px;"
      >
        The page you are looking for does not exist, has been removed, or is temporarily unavailable.
      </p>
      <button mat-flat-button color="primary" routerLink="/dashboard">
        <mat-icon>home</mat-icon>
        Back to Dashboard
      </button>
    </div>
  `,
})
export class NotFoundComponent {}
