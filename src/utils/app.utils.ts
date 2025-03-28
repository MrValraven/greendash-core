import { config } from 'dotenv';

config();

export const checkIfEnvironmentVariablesAreSet = (): never => {
  const requiredEnvironmentVariables = [
    'DATABASE_URL',
    'ACCESS_TOKEN_SECRET',
    'VERIFY_TOKEN_SECRET',
    'REFRESH_TOKEN_SECRET',
    'PASSWORD_RESET_TOKEN_SECRET',
    'MAIL_SERVICE_TOKEN',
    'MAILTRAP_API_KEY',
  ];

  requiredEnvironmentVariables.forEach((environmentVariable) => {
    if (!process.env[environmentVariable]) {
      console.error(`Error: Missing required environment variable: ${environmentVariable}`);
    }
  });

  process.exit(1);
};
