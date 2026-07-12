import { Component, inject, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthStore } from '@core/stores/auth.store';
import { AvatarComponent } from '@shared/components/avatar/avatar.component';
import { debounceTime, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AvatarComponent],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent {
  @Output() menuToggle = new EventEmitter<void>();

  readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  searchQuery = '';
  private readonly searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject.pipe(
      debounceTime(400),
      takeUntilDestroyed()
    ).subscribe(q => {
      if (q.trim()) this.router.navigate(['/search'], { queryParams: { q } });
    });
  }

  onSearch(query: string): void {
    this.searchSubject.next(query);
  }

  goToSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery } });
    }
  }
}
