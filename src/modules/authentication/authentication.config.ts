import dotenv from 'dotenv';

dotenv.config();

export const tokenSecrets = {
  verifyToken: process.env.VERIFY_TOKEN_SECRET!,
  accessToken: process.env.ACCESS_TOKEN_SECRET!,
  refreshToken: process.env.REFRESH_TOKEN_SECRET!,
  passwordResetToken: process.env.PASSWORD_RESET_TOKEN_SECRET!,
};
