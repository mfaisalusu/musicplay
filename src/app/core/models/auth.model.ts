export interface LoginDto {
  email: string;
  password: string;
  remember: boolean;
}

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthSession {
  userId: number;
  username: string;
  email: string;
  avatar: string;
}
