export interface Favorite {
  id: number;
  userId: number;
  type: 'playlist' | 'music';
  targetId: number;
  createdAt: string;
}

export interface History {
  id: number;
  userId: number;
  musicId: number;
  playlistId: number;
  playedAt: string;
}
