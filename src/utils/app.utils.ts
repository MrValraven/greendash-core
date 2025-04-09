import { config } from 'dotenv';

config();

const SERVER_ERROR_STATUS = 1;

const terminateNodeProcessWithError = () => {
  console.log(
    'There were some issues with the server configuration. Gracefully exiting process...',
  );
  process.exit(SERVER_ERROR_STATUS);
};

export const checkIfEnvironmentVariablesAreSet = () => {
  let hasMissingEnvironmentVariables = false;
  const requiredEnvironmentVariables = [
    'DATABASE_URL',
    'ACCESS_TOKEN_SECRET',
    'VERIFY_TOKEN_SECRET',
    'REFRESH_TOKEN_SECRET',
    'PASSWORD_RESET_TOKEN_SECRET',
    'MAIL_SERVICE_TOKEN',
  ];

  requiredEnvironmentVariables.forEach((environmentVariable) => {
    if (!process.env[environmentVariable]) {
      console.error(`Error: Missing required environment variable: ${environmentVariable}`);
      hasMissingEnvironmentVariables = true;
    }
  });

  if (hasMissingEnvironmentVariables) {
    terminateNodeProcessWithError();
  }
};
