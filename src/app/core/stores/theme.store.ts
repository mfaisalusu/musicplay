import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeStore {
  readonly theme = signal<Theme>((localStorage.getItem('mp_theme') as Theme) || 'dark');

  constructor() {
    effect(() => {
      const t = this.theme();
      document.documentElement.classList.toggle('dark', t === 'dark');
      localStorage.setItem('mp_theme', t);
    });
    document.documentElement.classList.toggle('dark', this.theme() === 'dark');
  }

  toggle(): void {
    this.theme.update(t => t === 'dark' ? 'light' : 'dark');
  }
}
