import { hashPassword, validatePassword } from './authentication.utils';
import { sendVerificationEmail } from '../mail/mailService';
import { ERRORS } from './authenticationErrors';
import { generateToken } from './authentication.utils';
import authenticationDB from './authenticationDB';

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

  const isPasswordMatch = await validatePassword(password, user.hashed_password);

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

export default { registerUserAccount, loginUserAccount };
