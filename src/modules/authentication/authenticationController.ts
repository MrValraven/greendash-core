import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { ERRORS } from './authenticationErrors';
import { generateToken } from './authentication.utils';
import authenticationMethods from './authenticationMethods';

interface FormattedError extends Error {
  statusCode?: number;
}

const registerUserAccount = async (request: Request, response: Response) => {
  const { email, password } = request.body;

  try {
    const user = await authenticationMethods.registerUserAccount(email, password);
    response.status(201).json(user);
  } catch (error) {
    if (error instanceof Error) {
      const formattedError: FormattedError = {
        name: error.name,
        message: error.message,
        statusCode: 401,
      };
      console.error(error.message);
      response.status(500).json(formattedError);
    }
  }
};

const loginUserAccount = async (request: Request, response: Response) => {
  const { email, password } = request.body;

  try {
    const token = await authenticationMethods.loginUserAccount(email, password);
    response.cookie('token', token.accessToken, { httpOnly: true });
    response.cookie('refreshToken', token.refreshToken, { httpOnly: true });
    response.status(200).json({ message: 'User logged in successfully', email, password, token });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      response.status(500).json({ error: error.message });
    }
  }
};

const refreshAccessToken = async (request: Request, response: Response) => {
  const cookies = request.cookies;

  if (!cookies?.refreshToken) {
    response.status(401);
  }

  const refreshToken = cookies.refreshToken;
  console.log(refreshToken);

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_TOKEN!) as {
      userId: number;
    };

    const isTokenValid = await authenticationMethods.verifyRefreshToken(
      decoded.userId,
      refreshToken,
    );
    if (!isTokenValid) {
      response.status(403);
    }

    const accessToken = generateToken(decoded.userId, process.env.ACCESS_TOKEN_SECRET!, '30s');

    response.cookie('token', accessToken, { httpOnly: true });
    response.status(200).json({ message: 'Access token refreshed successfully', accessToken });
  } catch (error) {
    console.error('Error verifying token:', error);
    response.status(401).json({ error: 'Unauthorized' });
  }
};

const logoutUserAccount = async (request: Request, response: Response) => {
  try {
    response.clearCookie('token');
    response.clearCookie('refreshToken');
    response.status(200).json({ message: 'User logged out successfully' });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      response.status(500).json({ error: error.message });
    }
  }
};

export default { registerUserAccount, loginUserAccount, refreshAccessToken, logoutUserAccount };
