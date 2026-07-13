import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerBarService } from '@core/services/player-bar.service';
import { getYoutubeThumbnail } from '@core/utils/url-detector.util';

@Component({
  selector: 'app-player-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player-bar.component.html',
  styleUrls: ['./player-bar.component.scss']
})
export class PlayerBarComponent implements OnInit {
  constructor(readonly player: PlayerBarService) {}

  ngOnInit(): void {
    this.player.initPlayer();
  }

  thumbnail(): string {
    const music = this.player.currentMusic();
    return music ? getYoutubeThumbnail(music.url) : '';
  }

  repeatTitle(): string {
    const map: Record<string, string> = { off: 'Repeat off', all: 'Repeat all', one: 'Repeat one' };
    return map[this.player.repeat()] ?? 'Repeat off';
  }

  formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  onSeek(event: Event): void {
    this.player.seek(+(event.target as HTMLInputElement).value);
  }

  onVolume(event: Event): void {
    this.player.setVolume(+(event.target as HTMLInputElement).value);
  }
}
