import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerBarService } from '@core/services/player-bar.service';

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {
  readonly player = inject(PlayerBarService);
  readonly showQueue = signal(false);
  private prevVolume = 80;

  ngOnInit(): void {
    this.player.initPlayer();
  }

  get progress(): number {
    const dur = this.player.duration();
    return dur > 0 ? (this.player.currentTime() / dur) * 100 : 0;
  }

  onSeek(event: Event): void {
    this.player.seek(+(event.target as HTMLInputElement).value);
  }

  onVolume(event: Event): void {
    this.player.setVolume(+(event.target as HTMLInputElement).value);
  }

  toggleMute(): void {
    if (this.player.volume() > 0) {
      this.prevVolume = this.player.volume();
      this.player.setVolume(0);
    } else {
      this.player.setVolume(this.prevVolume || 80);
    }
  }

  toggleQueue(): void {
    this.showQueue.update(v => !v);
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  platformClass(platform: string): string {
    const map: Record<string, string> = {
      youtube: 'bg-red-600/20 text-red-400',
      spotify: 'bg-green-600/20 text-green-400',
      soundcloud: 'bg-orange-600/20 text-orange-400'
    };
    return map[platform] || 'bg-surface-3 text-muted';
  }
}
