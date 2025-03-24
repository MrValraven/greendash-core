import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from './authentication.types';
import authenticationDB from './authenticationDB';
import { ERRORS } from './authenticationErrors';

const hashPassword = async (password: string) => {
  const SALT_ROUNDS = 10;
  return await bcrypt.hash(password, SALT_ROUNDS);
};

const validatePassword = async (password: string, hashedPassword: string) => {
  return await bcrypt.compare(password, hashedPassword);
};

const verifyTokenAndGetUser = async (token: string, tokenSecret: string): Promise<User> => {
  try {
    const decoded = jwt.verify(token, tokenSecret) as {
      userId: number;
    };

    const user = await authenticationDB.getUserFromDatabase('id', decoded.userId);

    if (!user) {
      throw new Error(ERRORS.USER_NOT_FOUND);
    }

    return user;
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

export { hashPassword, validatePassword, verifyTokenAndGetUser };
