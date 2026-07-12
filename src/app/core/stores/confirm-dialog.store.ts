import { Injectable, signal } from '@angular/core';

export interface DialogConfig {
  title: string;
  message: string;
  confirmText?: string;
  onConfirm: () => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogStore {
  readonly dialog = signal<DialogConfig | null>(null);

  open(config: DialogConfig): void {
    this.dialog.set(config);
  }

  confirm(): void {
    this.dialog()?.onConfirm();
    this.dialog.set(null);
  }

  cancel(): void {
    this.dialog.set(null);
  }
}
