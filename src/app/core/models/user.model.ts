export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  avatar: string;
  bio: string;
  isPrivate: boolean;
  followers: number;
  following: number;
  playlistCount: number;
  musicCount: number;
  createdAt: string;
}

export type CreateUserDto = Omit<User, 'id'>;
export type UpdateUserDto = Partial<Omit<User, 'id' | 'email' | 'createdAt'>>;
