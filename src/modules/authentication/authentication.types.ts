export interface User {
  id: number;
  hashed_password: string;
  email: string;
  role: string;
}

export interface RefreshToken {
  id: number;
  user_id: number;
  token: string;
  expires_at: Date;
  created_at: Date | null;
}
