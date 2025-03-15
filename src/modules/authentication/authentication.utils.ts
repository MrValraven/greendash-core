import bcrypt from 'bcryptjs';

const hashPassword = async (password: string) => {
  const SALT_ROUNDS = 10;
  return await bcrypt.hash(password, SALT_ROUNDS);
};

const validatePassword = async (password: string, hashedPassword: string) => {
  return await bcrypt.compare(password, hashedPassword);
};

const generateVerificationToken = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export { hashPassword, validatePassword, generateVerificationToken };
