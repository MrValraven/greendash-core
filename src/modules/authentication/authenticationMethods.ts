import { hashPassword, validatePassword, generateVerificationCode } from './authentication.utils';
import { sendVerificationEmail } from '../mail/mailService';
import { ERRORS } from './authenticationErrors';
import { generateToken } from './authentication.utils';
import authenticationDB from './authenticationDB';

const registerUserAccount = async (email: string, password: string) => {
  const userInDatabase = await authenticationDB.getUserFromDatabase(email);
  if (userInDatabase) {
    throw new Error(ERRORS.EMAIL_IN_USE);
  }

  const passwordHash = await hashPassword(password);

  const verificationCode = generateVerificationCode();
  const oneDayInMilliseconds = 24 * 60 * 60 * 1000;
  const tomorrowDate = new Date(Date.now() + oneDayInMilliseconds);
  const verificationCodeExpires = tomorrowDate;

  const createdUser = await authenticationDB.createUserInDatabase(
    email,
    passwordHash,
    verificationCode,
    verificationCodeExpires,
  );

  await sendVerificationEmail(email, verificationCode);

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

  const accessToken = generateToken(user.id, process.env.ACCESS_TOKEN_SECRET!, '30s');

  const refreshToken = generateToken(user.id, process.env.REFRESH_TOKEN_TOKEN!, '1d');

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 1);

  await authenticationDB.storeRefreshTokenInDatabase(user.id, refreshToken);

  // we should send token in http only cookie
  return { accessToken, refreshToken };
};

const verifyRefreshToken = async (userId: number, refreshToken: string): Promise<boolean> => {
  const storedRefreshToken = await authenticationDB.getRefreshTokenFromDatabase(
    userId,
    refreshToken,
  );

  return storedRefreshToken === refreshToken;
};

export default { registerUserAccount, loginUserAccount, verifyRefreshToken };
