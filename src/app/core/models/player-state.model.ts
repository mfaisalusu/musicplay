export type RepeatMode = 'off' | 'all' | 'one';

export interface PlayerState {
  currentMusic: import('./music.model').Music | null;
  queue: import('./music.model').Music[];
  originalQueue: import('./music.model').Music[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  shuffle: boolean;
  repeat: RepeatMode;
}
