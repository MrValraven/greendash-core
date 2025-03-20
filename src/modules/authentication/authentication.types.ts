export interface User {
  id: number;
  hashed_password: string;
  email_verified: boolean;
  email: string;
  role: 'user' | 'admin' | 'organization';
}

export interface RefreshToken {
  id: number;
  user_id: number;
  token: string;
  expires_at: Date;
  created_at: Date | null;
}
