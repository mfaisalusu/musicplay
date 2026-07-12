export interface Playlist {
  id: number;
  userId: number;
  title: string;
  description: string;
  cover: string;
  createdAt: string;
}

export type CreatePlaylistDto = Omit<Playlist, 'id'>;
export type UpdatePlaylistDto = Partial<Omit<Playlist, 'id' | 'userId' | 'createdAt'>>;
