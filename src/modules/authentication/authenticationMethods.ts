import {
  hashPassword,
  validatePassword,
  generateToken,
  verifyRefreshToken,
  getUserFromToken,
  validateUserUpdate,
  buildUserUpdate,
} from './authentication.utils';
import { ERRORS } from './authenticationErrors';
import authenticationDB from './authenticationDB';
import mailService from '../mail/mailService';
import { User, UserUpdate } from './authentication.types';

const registerUserAccount = async (email: string, password: string) => {
  const userInDatabase = await authenticationDB.getUserFromDatabase('email', email);
  if (userInDatabase) {
    throw new Error(ERRORS.EMAIL_IN_USE);
  }

  const passwordHash = await hashPassword(password);

  const createdUser = await authenticationDB.createUserInDatabase(email, passwordHash);

  const verificationToken = generateToken(createdUser.id, process.env.VERIFY_TOKEN_SECRET!, '1d');

  await mailService.sendVerificationEmail(email, verificationToken);

  return createdUser;
};

const verifyUserEmail = async (verificationToken: string) => {
  const user = await getUserFromToken(verificationToken, process.env.VERIFY_TOKEN_SECRET!);

  if (user.email_verified) {
    throw new Error(ERRORS.EMAIL_ALREADY_VERIFIED);
  }

  await authenticationDB.updateUserInDatabase(user.id, {
    email_verified: true,
  });
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

const refreshUserAccessToken = async (refreshToken: string) => {
  const user = await getUserFromToken(refreshToken, process.env.REFRESH_TOKEN_SECRET!);

  const isTokenValid = await verifyRefreshToken(user.id, refreshToken);
  if (!isTokenValid) {
    throw new Error(ERRORS.INVALID_REFRESH_TOKEN);
  }

  const accessToken = generateToken(user.id, process.env.ACCESS_TOKEN_SECRET!, '30s');

  return accessToken;
};

const requestUserPasswordReset = async (email: string) => {
  const user = await authenticationDB.getUserFromDatabase('email', email);

  if (!user) {
    throw new Error(ERRORS.USER_NOT_FOUND);
  }

  const passwordResetToken = generateToken(user.id, process.env.PASSWORD_RESET_TOKEN_SECRET!, '1h');

  await mailService.sendPasswordResetEmail(email, passwordResetToken);
};

const resetUserPassword = async (passwordResetToken: string, newPassword: string) => {
  const user = await getUserFromToken(passwordResetToken, process.env.PASSWORD_RESET_TOKEN_SECRET!);

  const hashedPassword = await hashPassword(newPassword);

  await authenticationDB.updateUserInDatabase(user.id, {
    hashed_password: hashedPassword,
  });
};

const updateUserAccount = async (user: User, update: UserUpdate) => {
  const validationResult = await validateUserUpdate(user, update);
  if (!validationResult.isValid) {
    throw new Error(validationResult.error);
  }

  const { updates, field } = await buildUserUpdate(update);

  const updatedUser = await authenticationDB.updateUserInDatabase(user.id, updates);
  if (!updatedUser) {
    throw new Error(ERRORS.USER_NOT_FOUND);
  }

  if (field === 'email') {
    await mailService.sendEmailChangeNotification(user.email, update.value);
  }

  if (field === 'password') {
    await mailService.sendPasswordChangeNotification(user.email);
  }

  return { updatedUser };
};

export default {
  registerUserAccount,
  verifyUserEmail,
  loginUserAccount,
  refreshUserAccessToken,
  requestUserPasswordReset,
  resetUserPassword,
  updateUserAccount,
};
