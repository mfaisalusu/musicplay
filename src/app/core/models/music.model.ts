export type MusicPlatform = 'youtube' | 'spotify' | 'soundcloud';

export interface Music {
  id: number;
  playlistId: number;
  platform: MusicPlatform;
  url: string;
  title: string;
  thumbnail: string;
  duration: string;
  order: number;
  createdAt: string;
}

export type CreateMusicDto = Omit<Music, 'id'>;
export type UpdateMusicDto = Partial<Omit<Music, 'id' | 'playlistId' | 'createdAt'>>;
