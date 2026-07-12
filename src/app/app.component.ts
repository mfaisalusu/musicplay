import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/components/toast/toast.component';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';
import { PlayerComponent } from './features/player/player.component';
import { ThemeStore } from './core/stores/theme.store';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent, ConfirmDialogComponent, PlayerComponent],
  template: `
    <router-outlet />
    <app-toast />
    <app-confirm-dialog />
    <app-player />
  `
})
export class AppComponent {
  // Initialize theme store to apply theme on startup
  private readonly themeStore = inject(ThemeStore);
}
