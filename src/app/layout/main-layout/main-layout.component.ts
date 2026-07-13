import { Component, signal, inject, HostListener } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { PlayerComponent } from '../../features/player/player.component';
import { LoadingStore } from '@core/stores/loading.store';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, NgClass, RouterOutlet, SidebarComponent, TopbarComponent, PlayerComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent {
  readonly loadingStore = inject(LoadingStore);
  readonly mobileMenuOpen = signal(false);
  readonly sidebarCollapsed = signal(false);
  readonly isDesktop = signal(window.innerWidth >= 1024);

  toggleMenu(): void {
    this.mobileMenuOpen.update(v => !v);
  }

  @HostListener('window:resize')
  onResize(): void {
    const desktop = window.innerWidth >= 1024;
    this.isDesktop.set(desktop);
    if (desktop) this.mobileMenuOpen.set(false);
  }
}
