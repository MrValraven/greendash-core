import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import authenticationDB from './authentication.database';
import { ERRORS } from './authentication.errors';
import { TokenType, UserField, UserFieldValue } from './authentication.types';
import { tokenSecrets } from './authentication.config';

const hashPassword = async (password: string) => {
  const SALT_ROUNDS = 10;
  return await bcrypt.hash(password, SALT_ROUNDS);
};

const validatePassword = async (password: string, hashedPassword: string) => {
  const isPasswordValid = await bcrypt.compare(password, hashedPassword);

  if (!isPasswordValid) {
    throw new Error(ERRORS.INVALID_CREDENTIALS);
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
      throw new Error(ERRORS.EXPIRED_TOKEN);
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error(ERRORS.INVALID_TOKEN);
    }
    throw error;
  }
};

const verifyIfRefreshTokenIsInDatabase = async (
  tokenFromUser: string | null,
  tokenFromRequest: string,
): Promise<void> => {
  if (tokenFromUser !== tokenFromRequest) {
    throw new Error(ERRORS.INVALID_REFRESH_TOKEN);
  }
};

const getUserFromDatabase = async (field: UserField, value: UserFieldValue) => {
  const user = await authenticationDB.getUserFromDatabase(field, value);

  if (!user) {
    throw new Error(ERRORS.USER_NOT_FOUND);
  }

  return user;
};

const getUserFromDatabaseViaTokenInfo = async (token: string, tokenType: TokenType) => {
  const decoded = await verifyToken(token, tokenType);
  const user = await getUserFromDatabase('id', decoded.userId);

  return user;
};

export {
  hashPassword,
  validatePassword,
  generateToken,
  verifyToken,
  verifyIfRefreshTokenIsInDatabase,
  getUserFromDatabase,
  getUserFromDatabaseViaTokenInfo,
};
