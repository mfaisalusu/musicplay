import { Injectable, signal, computed } from '@angular/core';
import { Music } from '../models/music.model';

export type RepeatMode = 'none' | 'one' | 'all';

@Injectable({ providedIn: 'root' })
export class PlayerStore {
  private readonly _queue = signal<Music[]>([]);
  private readonly _currentIndex = signal<number>(-1);
  private readonly _isPlaying = signal(false);
  private readonly _volume = signal(80);
  private readonly _isShuffle = signal(false);
  private readonly _repeatMode = signal<RepeatMode>('none');
  private readonly _showPlayer = signal(false);

  readonly queue = this._queue.asReadonly();
  readonly currentIndex = this._currentIndex.asReadonly();
  readonly isPlaying = this._isPlaying.asReadonly();
  readonly volume = this._volume.asReadonly();
  readonly isShuffle = this._isShuffle.asReadonly();
  readonly repeatMode = this._repeatMode.asReadonly();
  readonly showPlayer = this._showPlayer.asReadonly();

  readonly currentTrack = computed(() => {
    const idx = this._currentIndex();
    const q = this._queue();
    return idx >= 0 && idx < q.length ? q[idx] : null;
  });

  readonly hasPrev = computed(() => this._currentIndex() > 0);
  readonly hasNext = computed(() => this._currentIndex() < this._queue().length - 1);

  loadPlaylist(tracks: Music[], startIndex = 0): void {
    this._queue.set([...tracks]);
    this._currentIndex.set(startIndex);
    this._isPlaying.set(true);
    this._showPlayer.set(true);
  }

  playTrack(index: number): void {
    this._currentIndex.set(index);
    this._isPlaying.set(true);
  }

  togglePlay(): void {
    this._isPlaying.update(v => !v);
  }

  setPlaying(val: boolean): void {
    this._isPlaying.set(val);
  }

  next(): void {
    const q = this._queue();
    const idx = this._currentIndex();
    if (this._isShuffle()) {
      const next = Math.floor(Math.random() * q.length);
      this._currentIndex.set(next);
    } else if (idx < q.length - 1) {
      this._currentIndex.update(i => i + 1);
    } else if (this._repeatMode() === 'all') {
      this._currentIndex.set(0);
    }
  }

  prev(): void {
    const idx = this._currentIndex();
    if (idx > 0) this._currentIndex.update(i => i - 1);
  }

  toggleShuffle(): void {
    this._isShuffle.update(v => !v);
  }

  cycleRepeat(): void {
    const modes: RepeatMode[] = ['none', 'all', 'one'];
    const cur = this._repeatMode();
    const next = modes[(modes.indexOf(cur) + 1) % modes.length];
    this._repeatMode.set(next);
  }

  setVolume(vol: number): void {
    this._volume.set(vol);
  }

  closePlayer(): void {
    this._showPlayer.set(false);
    this._isPlaying.set(false);
  }
}
