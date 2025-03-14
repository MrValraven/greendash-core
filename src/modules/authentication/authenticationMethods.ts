import jwt, { verify } from 'jsonwebtoken';
import { hashPassword, validatePassword } from './authentication.utils';
import { ERRORS } from './authenticationErrors';
import authenticationDB from './authenticationDB';

const registerUserAccount = async (email: string, password: string) => {
  const userInDatabase = await authenticationDB.getUserFromDatabase(email);
  if (userInDatabase) {
    throw new Error(ERRORS.EMAIL_IN_USE);
  }

  const passwordHash = await hashPassword(password);
  const createdUser = await authenticationDB.createUserInDatabase(email, passwordHash);

  return createdUser;
};

const loginUserAccount = async (email: string, password: string) => {
  const user = await authenticationDB.getUserFromDatabase(email);

  if (!user) {
    throw new Error(ERRORS.USER_NOT_FOUND);
  }

  const isPasswordMatch = await validatePassword(password, user.hashed_password);

  if (!isPasswordMatch) {
    throw new Error(ERRORS.INVALID_CREDENTIALS);
  }

  const accessToken = jwt.sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: '30s',
  });

  const refreshToken = jwt.sign({ userId: user.id }, process.env.REFRESH_TOKEN_TOKEN!, {
    expiresIn: '1d',
  });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 1);

  await authenticationDB.storeRefreshTokenInDatabase(user.id, refreshToken, expiresAt);

  // we should send token in http only cookie
  return { accessToken, refreshToken };
};

const verifyRefreshToken = async (userId: number, refreshToken: string): Promise<boolean> => {
  const tokenRecord = await authenticationDB.getRefreshTokenFromDatabase(userId, refreshToken);
  return tokenRecord ? true : false;
};

export default { registerUserAccount, loginUserAccount, verifyRefreshToken };
