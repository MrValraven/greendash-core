import jwt from 'jsonwebtoken';
import { hashPassword, validatePassword, generateVerificationToken } from './authentication.utils';
import { ERRORS } from './authenticationErrors';
import authenticationDB from './authenticationDB';

const registerUserAccount = async (email: string, password: string) => {
  const user = await authenticationDB.getUserFromDatabase(email);
  if (user) {
    throw new Error(ERRORS.EMAIL_IN_USE);
  }

  const passwordHash = await hashPassword(password);

  const verificationToken = generateVerificationToken();
  const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const createdUser = await authenticationDB.createUserInDatabase(
    email,
    passwordHash,
    verificationToken,
    verificationTokenExpires,
  );

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

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
    expiresIn: '1d',
  });

  // we should send token in http only cookie
  return token;
};

export default { registerUserAccount, loginUserAccount };
