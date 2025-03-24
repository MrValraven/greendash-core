import jwt from 'jsonwebtoken';
import { hashPassword, validatePassword } from './authentication.utils';
import { ERRORS } from './authenticationErrors';
import authenticationDB from './authenticationDB';
import mailService from '../mail/mailService';
import { User, EditUserRequest } from './authentication.types';

const registerUserAccount = async (email: string, password: string) => {
  const userInDatabase = await authenticationDB.getUserFromDatabase('email', email);
  if (userInDatabase) {
    throw new Error(ERRORS.EMAIL_IN_USE);
  }

  const passwordHash = await hashPassword(password);
  const createdUser = await authenticationDB.createUserInDatabase(email, passwordHash);

  return createdUser;
};

const loginUserAccount = async (email: string, password: string) => {
  const user = await authenticationDB.getUserFromDatabase('email', email);

  if (!user) {
    throw new Error(ERRORS.USER_NOT_FOUND);
  }

  const isPasswordMatch = await validatePassword(password, user.hashed_password);

  if (!isPasswordMatch) {
    throw new Error(ERRORS.INVALID_CREDENTIALS);
  }

  //temporary function to remove all refresh tokens from database every time user logs in)
  await authenticationDB.removeAllUserRefreshTokensFromDatabase(user.id);

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

const validateAndBuildUpdates = async (
  user: User,
  updates: EditUserRequest,
): Promise<{ updates: Partial<User>; emailChanged: boolean; passwordChanged: boolean }> => {
  const result = {
    updates: {} as Partial<User>,
    emailChanged: false,
    passwordChanged: false,
  };

  if (updates.email) {
    if (updates.email === user.email) {
      throw new Error('This new email cannot be the same as the current email');
    }
    result.updates.email = updates.email;
    result.emailChanged = true;
  }

  if (updates.password) {
    const isSamePassword = await validatePassword(updates.password, user.hashed_password);
    if (isSamePassword) {
      throw new Error('The new password cannot be the same as the current password');
    }
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

export default {
  registerUserAccount,
  loginUserAccount,
  verifyRefreshToken,
  validateAndBuildUpdates,
  sendUpdateNotifications,
};
