import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/components/toast/toast.component';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';
import { ThemeStore } from './core/stores/theme.store';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent, ConfirmDialogComponent],
  template: `
    <router-outlet />
    <app-toast />
    <app-confirm-dialog />
  `
})
export class AppComponent {
  // Initialize theme store to apply theme on startup
  private readonly themeStore = inject(ThemeStore);
}
