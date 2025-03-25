export interface User {
  id: number;
  hashed_password: string;
  email_verified: boolean;
  email: string;
  role: 'user' | 'admin' | 'organization';
}

export type UpdatableUserField = 'email' | 'password';
export interface UserUpdate {
  field: UpdatableUserField;
  value: string;
  currentPassword: string;
}

export type UserField = 'id' | 'email';
export type UserFieldValue = string | number;
