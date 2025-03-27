import { tokenSecrets } from './authentication.config';

export interface User {
  id: number;
  hashed_password: string;
  email_verified: boolean;
  email: string;
  role: 'user' | 'admin' | 'organization';
  refresh_token: string | null;
}

export type UpdatableUserField = 'email' | 'password';
export interface UserUpdate {
  field: UpdatableUserField;
  value: string;
  currentPassword: string;
}

export type TokenType = keyof typeof tokenSecrets;

export type UserField = 'id' | 'email';
export type UserFieldValue = string | number;
