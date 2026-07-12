import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastStore } from '../../../core/stores/toast.store';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})

export class ToastComponent {
  readonly store = inject(ToastStore);

  toastClass(type: string): string {
    const map: Record<string, string> = {
      success: 'bg-green-600 text-white',
      error: 'bg-red-600 text-white',
      warning: 'bg-yellow-500 text-white',
      info: 'bg-blue-600 text-white'
    };
    return map[type] || map['info'];
  }

  toastIcon(type: string): string {
    const map: Record<string, string> = {
      success: '✓', error: '✕', warning: '⚠', info: 'ℹ'
    };
    return map[type] || 'ℹ';
  }
}
