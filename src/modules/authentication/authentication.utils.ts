import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import authenticationDB from './authentication.database.js';
import { ERRORS } from './authentication.errors.js';
import { ErrorCategories, TokenType, UserField, UserFieldValue } from './authentication.types.js';
import { tokenSecrets } from './authentication.config.js';

const hashPassword = async (password: string) => {
  const SALT_ROUNDS = 10;
  return await bcrypt.hash(password, SALT_ROUNDS);
};

const validatePassword = async (password: string, hashedPassword: string) => {
  const isPasswordValid = await bcrypt.compare(password, hashedPassword);

  if (!isPasswordValid) {
    throw new Error(ERRORS.INVALID_CREDENTIALS.message);
  }
};

const generateToken = (
  userId: number,
  tokenType: TokenType,
  expiresIn: jwt.SignOptions['expiresIn'],
): string => {
  return jwt.sign({ userId }, tokenSecrets[tokenType], { expiresIn });
};

const verifyToken = async (token: string, tokenType: TokenType) => {
  try {
    const decoded = jwt.verify(token, tokenSecrets[tokenType]) as {
      userId: number;
    };
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error(ERRORS.EXPIRED_TOKEN.message);
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error(ERRORS.INVALID_TOKEN.message);
    }
    throw error;
  }
};

const verifyIfRefreshTokenIsInDatabase = async (
  tokenFromUser: string | null,
  tokenFromRequest: string,
): Promise<void> => {
  if (tokenFromUser !== tokenFromRequest) {
    throw new Error(ERRORS.INVALID_REFRESH_TOKEN.message);
  }
};

const getUserFromDatabase = async (field: UserField, value: UserFieldValue) => {
  const user = await authenticationDB.getUserFromDatabase(field, value);

  if (!user) {
    throw new Error(ERRORS.USER_NOT_FOUND.message);
  }

  return user;
};

const getUserFromDatabaseViaTokenInfo = async (token: string, tokenType: TokenType) => {
  const decoded = await verifyToken(token, tokenType);
  const user = await getUserFromDatabase('id', decoded.userId);

  return user;
};

const sendHttpOnlySecureCookie = (response: Response, cookieName: string, token: string) => {
  response.cookie(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
};

const sendCustomErrorResponse = (response: Response, errorType: ErrorCategories) => {
  const statusCode = ERRORS[errorType].statusCode;
  const errorMessage = ERRORS[errorType].message;

  response.status(statusCode).json({
    success: false,
    message: errorMessage,
  });
};

export {
  hashPassword,
  validatePassword,
  generateToken,
  verifyToken,
  verifyIfRefreshTokenIsInDatabase,
  getUserFromDatabase,
  getUserFromDatabaseViaTokenInfo,
  sendHttpOnlySecureCookie,
  sendCustomErrorResponse,
};
