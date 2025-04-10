import {
  hashPassword,
  validatePassword,
  generateToken,
  verifyIfRefreshTokenIsInDatabase,
  getUserFromDatabase,
  getUserFromDatabaseViaTokenInfo,
} from './authentication.utils';
import { createGoogleUser, getGoogleTokens, getGoogleUserInfo } from '../oauth/oauth.utils';
import { ERRORS } from './authentication.errors';
import authenticationDB from './authentication.database';
import mailService from '../mail/mail.service';
import { EditUserSchema } from './authentication.schemas';
import { NotificationEmailCategory } from '../mail/mail.types';
import { User } from './authentication.types';

const registerUserAccount = async (email: string, password: string) => {
  const userInDatabase = await authenticationDB.getUserFromDatabase('email', email);

  if (userInDatabase) {
    throw new Error(ERRORS.EMAIL_IN_USE.message);
  }

  const passwordHash = await hashPassword(password);
  const createdUser = await authenticationDB.createUserInDatabase(email, passwordHash);
  const verificationToken = generateToken(createdUser.id, 'verifyToken', '1d');

  await mailService.sendVerificationEmail(email, 'emailVerification', verificationToken);

  return createdUser;
};

const verifyUserEmail = async (verificationToken: string) => {
  const user = await getUserFromDatabaseViaTokenInfo(verificationToken, 'verifyToken');

  if (user.email_verified) {
    throw new Error(ERRORS.EMAIL_ALREADY_VERIFIED.message);
  }

  await authenticationDB.updateUserInDatabase(user.id, {
    email_verified: true,
  });
};

const loginUserAccount = async (email: string, password: string) => {
  const user = await getUserFromDatabase('email', email);

  await validatePassword(password, user.hashed_password!);

  const accessToken = generateToken(user.id, 'accessToken', '30s');
  const refreshToken = generateToken(user.id, 'refreshToken', '1d');

  await authenticationDB.storeRefreshTokenInDatabase(user.id, refreshToken);

  return { accessToken, refreshToken };
};

const refreshUserAccessToken = async (refreshToken: string) => {
  const user = await getUserFromDatabaseViaTokenInfo(refreshToken, 'refreshToken');

  await verifyIfRefreshTokenIsInDatabase(user.refresh_token, refreshToken);

  const accessToken = generateToken(user.id, 'accessToken', '30s');
  return accessToken;
};

const requestUserPasswordReset = async (email: string) => {
  const user = await getUserFromDatabase('email', email);
  const passwordResetToken = generateToken(user.id, 'passwordResetToken', '1h');

  await mailService.sendVerificationEmail(email, 'passwordReset', passwordResetToken);
};

const resetUserPassword = async (passwordResetToken: string, newPassword: string) => {
  const user = await getUserFromDatabaseViaTokenInfo(passwordResetToken, 'passwordResetToken');
  const hashedPassword = await hashPassword(newPassword);

  await authenticationDB.updateUserInDatabase(user.id, {
    hashed_password: hashedPassword,
  });
};

const updateUserAccount = async (token: string, requestedUpdate: EditUserSchema) => {
  const { userFieldName } = requestedUpdate;
  let { userFieldValue } = requestedUpdate;
  let emailCategory: NotificationEmailCategory = 'emailChange';

  const user = await getUserFromDatabaseViaTokenInfo(token, 'accessToken');

  if (userFieldName === 'password') {
    await validatePassword(requestedUpdate.currentPassword, user.hashed_password);

    userFieldValue = await hashPassword(userFieldValue);
    emailCategory = 'passwordChange';
  }

  const fieldToUpdate = {
    [userFieldName]: userFieldValue,
  };

  const updatedUser = await authenticationDB.updateUserInDatabase(user.id, fieldToUpdate);

  if (!updatedUser) {
    throw new Error(ERRORS.USER_NOT_FOUND.message);
  }

  const dataToSendInEmailBody = userFieldName === 'email' ? updatedUser.email : undefined;

  await mailService.sendNotificationEmail(user.email, emailCategory, dataToSendInEmailBody);

  return { updatedUser };
};

const getCurrentUserData = async (token: string) => {
  const userData = await getUserFromDatabaseViaTokenInfo(token, 'accessToken');

  const requiredUserData: Partial<User> = {
    email: userData.email,
    role: userData.role,
  };

  return requiredUserData;
};

const authenticateWithGoogle = async (code: string) => {
  const { access_token } = await getGoogleTokens(code);

  const googleUser = await getGoogleUserInfo(access_token);

  if (!googleUser.verified_email) {
    throw new Error(ERRORS.GOOGLE_EMAIL_NOT_VERIFIED.message);
  }

  let user = await authenticationDB.getUserFromDatabase('email', googleUser.email);

  if (!user) {
    const createdUser = await createGoogleUser(googleUser.email);
    user = await authenticationDB.getUserFromDatabase('id', createdUser.id);

    if (!user) {
      throw new Error(ERRORS.USER_NOT_FOUND.message);
    }
  }

  const accessToken = generateToken(user.id, 'accessToken', '30s');
  const refreshToken = generateToken(user.id, 'refreshToken', '1d');

  await authenticationDB.storeRefreshTokenInDatabase(user.id, refreshToken);

  return { accessToken, refreshToken };
};

export default {
  registerUserAccount,
  verifyUserEmail,
  loginUserAccount,
  refreshUserAccessToken,
  requestUserPasswordReset,
  resetUserPassword,
  updateUserAccount,
  getCurrentUserData,
  authenticateWithGoogle,
};
