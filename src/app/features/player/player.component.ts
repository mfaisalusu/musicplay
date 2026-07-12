import { Component, inject, signal, effect, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FavoriteService } from '@core/services/favorite.service';
import { AuthStore } from '@core/stores/auth.store';
import { PlayerStore } from '@core/stores/player.store';
import { getEmbedUrl } from '@core/utils/url-detector.util';

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnDestroy {
  readonly playerStore: PlayerStore = inject(PlayerStore);
  private readonly sanitizer: DomSanitizer = inject(DomSanitizer);
  private readonly authStore: AuthStore = inject(AuthStore);
  private readonly favoriteService: FavoriteService = inject(FavoriteService);

  readonly showQueue = signal(false);
  readonly embedUrl = signal<SafeResourceUrl | null>(null);
  readonly progress = signal(0);
  readonly currentTime = signal(0);

  private progressInterval: ReturnType<typeof setInterval> | null = null;
  private trackStartTime = 0;

  constructor() {
    effect(() => {
      const track = this.playerStore.currentTrack();
      if (track) {
        const url = getEmbedUrl(track.platform, track.url);
        this.embedUrl.set(url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null);
        this.progress.set(0);
        this.currentTime.set(0);
        this.trackStartTime = Date.now();
        this.startProgress(track.duration);
      } else {
        this.embedUrl.set(null);
        this.stopProgress();
      }
    });

    effect(() => {
      if (this.playerStore.isPlaying()) {
        this.trackStartTime = Date.now() - this.currentTime() * 1000;
      } else {
        this.stopProgress();
      }
    });
  }

  private startProgress(duration: string): void {
    this.stopProgress();
    const totalSeconds = this.parseDuration(duration);
    if (totalSeconds <= 0) return;

    this.progressInterval = setInterval(() => {
      if (!this.playerStore.isPlaying()) return;
      const elapsed = (Date.now() - this.trackStartTime) / 1000;
      this.currentTime.set(Math.min(elapsed, totalSeconds));
      this.progress.set(Math.min((elapsed / totalSeconds) * 100, 100));
      if (elapsed >= totalSeconds) {
        this.stopProgress();
        if (this.playerStore.repeatMode() === 'one') {
          this.progress.set(0);
          this.currentTime.set(0);
          this.trackStartTime = Date.now();
          this.startProgress(duration);
        } else {
          this.playerStore.next();
        }
      }
    }, 1000);
  }

  private stopProgress(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  private parseDuration(duration: string): number {
    if (!duration) return 0;
    const parts = duration.split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  onProgressClick(event: MouseEvent): void {
    const bar = event.currentTarget as HTMLElement;
    const ratio = event.offsetX / bar.offsetWidth;
    const track = this.playerStore.currentTrack();
    if (!track) return;
    const totalSeconds = this.parseDuration(track.duration);
    if (totalSeconds > 0) {
      const newTime = ratio * totalSeconds;
      this.currentTime.set(newTime);
      this.progress.set(ratio * 100);
      this.trackStartTime = Date.now() - newTime * 1000;
    }
  }

  togglePlay(): void {
    this.playerStore.togglePlay();
  }

  toggleQueue(): void {
    this.showQueue.update(v => !v);
  }

  platformClass(platform: string): string {
    const map: Record<string, string> = {
      youtube: 'bg-red-600/20 text-red-400',
      spotify: 'bg-green-600/20 text-green-400',
      soundcloud: 'bg-orange-600/20 text-orange-400'
    };
    return map[platform] || 'bg-surface-3 text-muted';
  }

  onVolume(event: Event): void {
    this.playerStore.setVolume(Number((event.target as HTMLInputElement).value));
  }

  ngOnDestroy(): void {
    this.stopProgress();
  }
}
