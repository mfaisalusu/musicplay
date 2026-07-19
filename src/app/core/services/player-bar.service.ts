import { Injectable, signal, computed } from '@angular/core';
import { Music } from '../models/music.model';
import { PlayerState, RepeatMode } from '../models/player-state.model';
import { extractYoutubeId } from '../utils/url-detector.util';

declare const YT: any;

@Injectable({ providedIn: 'root' })
export class PlayerBarService {
  private player: any = null;
  private progressInterval: any = null;

  private state = signal<PlayerState>({
    currentMusic: null,
    queue: [],
    originalQueue: [],
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 80,
    shuffle: false,
    repeat: 'off',
  });

  readonly currentMusic = computed(() => this.state().currentMusic);
  readonly queue        = computed(() => this.state().queue);
  readonly isPlaying    = computed(() => this.state().isPlaying);
  readonly currentTime  = computed(() => this.state().currentTime);
  readonly duration     = computed(() => this.state().duration);
  readonly volume       = computed(() => this.state().volume);
  readonly shuffle      = computed(() => this.state().shuffle);
  readonly repeat       = computed(() => this.state().repeat);
  readonly showPlayer   = computed(() => this.state().currentMusic !== null);

  initPlayer(): void {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.state().isPlaying && this.player?.getPlayerState?.() !== 1) {
        this.player?.playVideo();
      }
    });
    if ((window as any)['YT']) {
      this.createPlayer();
      return;
    }
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
    (window as any)['onYouTubeIframeAPIReady'] = () => this.createPlayer();
  }

  private createPlayer(): void {
    this.player = new YT.Player('yt-player', {
      height: '0', width: '0',
      playerVars: { controls: 0, disablekb: 1 },
      events: {
        onStateChange: (e: any) => this.onStateChange(e),
        onReady: (e: any) => {
          e.target.unMute();
          e.target.setVolume(this.state().volume);
        },
      },
    });
  }

  play(music: Music, queue: Music[] = []): void {
    const shuffled = this.state().shuffle && queue.length > 1
      ? this.buildShuffledQueue(queue, music)
      : queue;
    this.state.update(s => ({
      ...s,
      currentMusic: music,
      queue: shuffled,
      originalQueue: queue,
      isPlaying: true,
      currentTime: 0,
      duration: 0,
    }));
    this.updateMediaSession(music);
    const id = extractYoutubeId(music.url);
    if (id && this.player?.loadVideoById) {
      this.player.loadVideoById(id);
    }
  }

  togglePlay(): void {
    if (!this.player) return;
    if (this.state().isPlaying) {
      this.player.pauseVideo();
    } else {
      this.player.playVideo();
    }
    this.state.update(s => ({ ...s, isPlaying: !s.isPlaying }));
  }

  next(): void {
    const { queue, currentMusic, repeat } = this.state();
    if (repeat === 'one') { this.replayCurrentTrack(); return; }
    const idx = queue.findIndex(m => m.id === currentMusic?.id);
    if (idx < queue.length - 1) {
      this.playInQueue(queue[idx + 1]);
    } else if (repeat === 'all' && queue.length > 0) {
      this.playInQueue(queue[0]);
    }
  }

  prev(): void {
    const { queue, currentMusic, repeat } = this.state();
    if (repeat === 'one' || this.state().currentTime > 3) {
      this.replayCurrentTrack();
      return;
    }
    const idx = queue.findIndex(m => m.id === currentMusic?.id);
    if (idx > 0) {
      this.playInQueue(queue[idx - 1]);
    } else if (repeat === 'all' && queue.length > 0) {
      this.playInQueue(queue[queue.length - 1]);
    }
  }

  toggleShuffle(): void {
    const { shuffle, originalQueue, currentMusic, queue } = this.state();
    if (!shuffle) {
      const newQueue = currentMusic
        ? this.buildShuffledQueue(originalQueue.length ? originalQueue : queue, currentMusic)
        : [...queue].sort(() => Math.random() - 0.5);
      this.state.update(s => ({ ...s, shuffle: true, queue: newQueue }));
    } else {
      const base = originalQueue.length ? originalQueue : queue;
      this.state.update(s => ({ ...s, shuffle: false, queue: base }));
    }
  }

  cycleRepeat(): void {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const next = modes[(modes.indexOf(this.state().repeat) + 1) % modes.length];
    this.state.update(s => ({ ...s, repeat: next }));
  }

  seek(time: number): void {
    this.player?.seekTo(time, true);
    this.state.update(s => ({ ...s, currentTime: time }));
  }

  setVolume(vol: number): void {
    this.player?.setVolume(vol);
    this.state.update(s => ({ ...s, volume: vol }));
  }

  closePlayer(): void {
    this.player?.stopVideo();
    clearInterval(this.progressInterval);
    this.state.update(s => ({ ...s, currentMusic: null, isPlaying: false, currentTime: 0, duration: 0 }));
  }

  private playInQueue(music: Music): void {
    this.state.update(s => ({ ...s, currentMusic: music, isPlaying: true, currentTime: 0, duration: 0 }));
    const id = extractYoutubeId(music.url);
    if (id) this.player?.loadVideoById(id);
  }

  private replayCurrentTrack(): void {
    this.player?.seekTo(0, true);
    this.player?.playVideo();
    this.state.update(s => ({ ...s, currentTime: 0, isPlaying: true }));
  }

  private buildShuffledQueue(queue: Music[], current: Music): Music[] {
    const others = queue.filter(m => m.id !== current.id).sort(() => Math.random() - 0.5);
    return [current, ...others];
  }

  private updateMediaSession(music: any): void {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: music.title ?? '',
      artist: music.artist ?? '',
      artwork: music.coverUrl ? [{ src: music.coverUrl }] : [],
    });
    navigator.mediaSession.setActionHandler('play', () => { this.player?.playVideo(); this.state.update(s => ({ ...s, isPlaying: true })); });
    navigator.mediaSession.setActionHandler('pause', () => { this.player?.pauseVideo(); this.state.update(s => ({ ...s, isPlaying: false })); });
    navigator.mediaSession.setActionHandler('nexttrack', () => this.next());
    navigator.mediaSession.setActionHandler('previoustrack', () => this.prev());
  }

  private onStateChange(event: any): void {
    if (event.data === 1) {
      // playing
      this.state.update(s => ({ ...s, isPlaying: true, duration: this.player.getDuration() }));
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
      this.startProgress();
    } else if (event.data === 0) {
      // ended
      this.state.update(s => ({ ...s, isPlaying: false }));
      clearInterval(this.progressInterval);
      this.next();
    } else if (event.data === 2) {
      // paused — resume jika state masih isPlaying (browser auto-pause saat tab hidden)
      if (this.state().isPlaying && document.hidden) {
        this.player?.playVideo();
        return;
      }
      this.state.update(s => ({ ...s, isPlaying: false }));
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
      clearInterval(this.progressInterval);
    } else {
      // buffering dll
      clearInterval(this.progressInterval);
    }
  }

  private startProgress(): void {
    clearInterval(this.progressInterval);
    this.progressInterval = setInterval(() => {
      if (this.player?.getCurrentTime) {
        this.state.update(s => ({ ...s, currentTime: this.player.getCurrentTime() }));
      }
    }, 500);
  }
}
