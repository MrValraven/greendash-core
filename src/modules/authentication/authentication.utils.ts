import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { SignOptions } from 'jsonwebtoken';

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
  expiresIn: SignOptions['expiresIn'],
): string => {
  return jwt.sign({ userId }, secret!, { expiresIn });
};

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export { hashPassword, validatePassword, generateToken, generateVerificationCode };
