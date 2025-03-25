import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import authenticationDB from './authenticationDB';
import { ERRORS } from './authenticationErrors';
import { User, EditUserRequest } from './authentication.types';
import mailService from '../mail/mailService';

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

const validateUpdates = async (user: User, updates: EditUserRequest) => {
  if (updates.email && updates.email === user.email) {
    return {
      isValid: false,
      errorMessage: 'This new email cannot be the same as the current email',
    };
  }

  if (updates.password) {
    const isSamePassword = await validatePassword(updates.password, user.hashed_password);
    if (isSamePassword) {
      return {
        isValid: false,
        errorMessage: 'The new password cannot be the same as the current password',
      };
    }
  }

  return { isValid: true };
};

const buildUpdates = async (updates: EditUserRequest) => {
  const result = {
    updates: {} as Partial<User>,
    emailChanged: false,
    passwordChanged: false,
  };

  if (updates.email) {
    result.updates.email = updates.email;
    result.emailChanged = true;
  }

  if (updates.password) {
    result.updates.hashed_password = await hashPassword(updates.password);
    result.passwordChanged = true;
  }

  return result;
};

const sendUpdateNotifications = async (
  email: string,
  newEmail: string | undefined,
  emailChanged: boolean,
  passwordChanged: boolean,
) => {
  if (emailChanged && passwordChanged) {
    await mailService.sendEmailAndPasswordChangeNotification(email, newEmail!);
  } else if (emailChanged) {
    await mailService.sendEmailChangeNotification(email, newEmail!);
  } else if (passwordChanged) {
    await mailService.sendPasswordChangeNotification(email);
  }
};

export {
  hashPassword,
  validatePassword,
  generateToken,
  verifyToken,
  verifyRefreshToken,
  getUserFromToken,
  validateUpdates,
  buildUpdates,
  sendUpdateNotifications,
};
