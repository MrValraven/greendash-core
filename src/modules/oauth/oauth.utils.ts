import { GOOGLE_OAUTH_CONFIG } from './oauth.config';
import { GoogleTokensResponse, GoogleUserInfoResponse } from './oauth.types';
import { ERRORS } from '../authentication/authentication.errors';
import { generateRandomPassword, hashPassword } from '../authentication/authentication.utils';
import authenticationDB from '../authentication/authentication.database';

const getGoogleOAuthURL = (): string => {
  const options = new URLSearchParams({
    redirect_uri: GOOGLE_OAUTH_CONFIG.redirect_uri,
    client_id: GOOGLE_OAUTH_CONFIG.client_id,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: GOOGLE_OAUTH_CONFIG.scopes.join(' '),
  });

  return `${GOOGLE_OAUTH_CONFIG.auth_uri}?${options.toString()}`;
};

const getGoogleTokens = async (code: string): Promise<GoogleTokensResponse> => {
  const body = new URLSearchParams({
    code,
    client_id: GOOGLE_OAUTH_CONFIG.client_id,
    client_secret: GOOGLE_OAUTH_CONFIG.client_secret,
    redirect_uri: GOOGLE_OAUTH_CONFIG.redirect_uri,
    grant_type: 'authorization_code',
  });

  try {
    const response = await fetch(GOOGLE_OAUTH_CONFIG.token_uri, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    const data = await response.json();
    if (!data) {
      throw new Error(ERRORS.INVALID_GOOGLE_RESPONSE.message);
    }

    return data;
  } catch (error) {
    console.error('Google token retrieval error:', error);
    throw new Error(ERRORS.GOOGLE_TOKEN_FAILURE.message);
  }
};

const getGoogleUserInfo = async (accessToken: string): Promise<GoogleUserInfoResponse> => {
  try {
    const response = await fetch(GOOGLE_OAUTH_CONFIG.userinfo_uri, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();
    if (!data) {
      throw new Error(ERRORS.INVALID_GOOGLE_RESPONSE.message);
    }
    return data;
  } catch (error) {
    console.error('Google user info retrieval error:', error);
    throw new Error(ERRORS.GOOGLE_USER_INFO_FAILURE.message);
  }
};

const createGoogleUser = async (googleUserEmail: string) => {
  const userInDatabase = await authenticationDB.getUserFromDatabase('email', googleUserEmail);

  if (userInDatabase) {
    throw new Error(ERRORS.EMAIL_IN_USE.message);
  }

  const hashedPassword = await hashPassword(generateRandomPassword());
  const createdUser = await authenticationDB.createUserInDatabase(googleUserEmail, hashedPassword);

  if (!createdUser) {
    throw new Error(ERRORS.INTERNAL_SERVER_ERROR.message);
  }

  return createdUser;
};

export { getGoogleOAuthURL, getGoogleTokens, getGoogleUserInfo, createGoogleUser };
