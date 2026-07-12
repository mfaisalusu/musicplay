import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthStore } from '@core/stores/auth.store';
import { AuthService } from '@core/services/auth.service';
import { ThemeStore } from '@core/stores/theme.store';
import { AvatarComponent } from '@shared/components/avatar/avatar.component';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, AvatarComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() collapsedChange = new EventEmitter<boolean>();

  readonly authStore = inject(AuthStore);
  readonly themeStore = inject(ThemeStore);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly navItems: NavItem[] = [
    { label: 'Home', icon: '🏠', route: '/home' },
    { label: 'Dashboard', icon: '📊', route: '/dashboard' },
    { label: 'My Playlists', icon: '🎵', route: '/playlist' },
    { label: 'Search', icon: '🔍', route: '/search' },
    { label: 'Settings', icon: '⚙️', route: '/setting' }
  ];

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
