import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import authenticationDB from './authenticationDB';
import { ERRORS } from './authenticationErrors';
import { User, UserUpdate } from './authentication.types';

const hashPassword = async (password: string) => {
  const SALT_ROUNDS = 10;
  return await bcrypt.hash(password, SALT_ROUNDS);
};

const validatePassword = async (password: string, hashedPassword: string) => {
  return await bcrypt.compare(password, hashedPassword);
};

const generateToken = (
  userId: number,
  secret: string,
  expiresIn: jwt.SignOptions['expiresIn'],
): string => {
  return jwt.sign({ userId }, secret!, { expiresIn });
};

const verifyToken = async (token: string, tokenSecret: string) => {
  try {
    const decoded = jwt.verify(token, tokenSecret) as {
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

const verifyRefreshToken = async (userId: number, refreshToken: string): Promise<boolean> => {
  const tokenRecord = await authenticationDB.getRefreshTokenFromDatabase(userId, refreshToken);
  return tokenRecord ? true : false;
};

const getUserFromToken = async (token: string, tokenSecret: string) => {
  const decoded = await verifyToken(token, tokenSecret);
  const user = await authenticationDB.getUserFromDatabase('id', decoded.userId);

  if (!user) {
    throw new Error(ERRORS.USER_NOT_FOUND);
  }

  return user;
};

const validateUserUpdate = async (user: User, update: UserUpdate) => {
  const isPasswordValid = await validatePassword(update.currentPassword, user.hashed_password);
  if (!isPasswordValid) {
    return { isValid: false, error: ERRORS.INVALID_CURRENT_PASSWORD };
  }

  switch (update.field) {
    case 'email':
      if (update.value === user.email) {
        return { isValid: false, error: ERRORS.SAME_EMAIL };
      }
      const existingUser = await authenticationDB.getUserFromDatabase('email', update.value);
      if (existingUser) {
        return { isValid: false, error: ERRORS.EMAIL_IN_USE };
      }
      break;

    case 'password':
      const isSamePassword = await validatePassword(update.value, user.hashed_password);
      if (isSamePassword) {
        return { isValid: false, error: ERRORS.SAME_PASSWORD };
      }
      break;
  }

  return { isValid: true };
};

const buildUserUpdate = async (update: UserUpdate) => {
  switch (update.field) {
    case 'password':
      return {
        updates: {
          hashed_password: await hashPassword(update.value),
        },
        field: 'password',
      };
    case 'email':
      return {
        updates: {
          email: update.value,
        },
        field: 'email',
      };
    default:
      throw new Error(ERRORS.INVALID_UPDATE_FIELD);
  }
};

export {
  hashPassword,
  validatePassword,
  generateToken,
  verifyToken,
  verifyRefreshToken,
  getUserFromToken,
  validateUserUpdate,
  buildUserUpdate,
};
