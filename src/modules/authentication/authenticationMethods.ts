import { hashPassword, validatePassword } from './authentication.utils';
import { sendVerificationEmail } from '../mail/mailService';
import { ERRORS } from './authenticationErrors';
import { generateToken } from './authentication.utils';
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

  const verificationToken = generateToken(createdUser.id, process.env.VERIFY_TOKEN_SECRET!, '1d');

  await sendVerificationEmail(email, verificationToken);

  return createdUser;
};

const loginUserAccount = async (email: string, password: string) => {
  const user = await authenticationDB.getUserFromDatabase('email', email);

  if (!user) {
    throw new Error(ERRORS.USER_NOT_FOUND);
  }

  const isPasswordMatch = await validatePassword(password, user.hashed_password!);

  if (!isPasswordMatch) {
    throw new Error(ERRORS.INVALID_CREDENTIALS);
  }

  const accessToken = generateToken(user.id, process.env.ACCESS_TOKEN_SECRET!, '30s');

  const refreshToken = generateToken(user.id, process.env.REFRESH_TOKEN_TOKEN!, '1d');

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 1);

  await authenticationDB.storeRefreshTokenInDatabase(user.id, refreshToken);

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
