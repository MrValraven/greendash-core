import dotenv from 'dotenv';
import { BASE_CORE_API_PATH } from '../../constants/app.constants';

dotenv.config();

export const GOOGLE_OAUTH_CONFIG = {
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  userinfo_uri: 'https://wwww.googleapis.com/oauth2/v2/userinfo',
  redirect_uri: `${BASE_CORE_API_PATH}/users/oauth/google/callback`,
  client_id: process.env.GOOGLE_CLIENT_ID!,
  client_secret: process.env.GOOGLE_CLIENT_SECRET!,
  scopes: ['email', 'profile'],
};
