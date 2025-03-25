export interface User {
  id: number;
  hashed_password: string;
  email_verified: boolean;
  email: string;
  role: 'user' | 'admin' | 'organization';
}

export interface EditUserRequest {
  email?: string;
  password?: string;
  currentPassword: string;
}

export type UserField = 'id' | 'email';
export type UserFieldValue = string | number;
