import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { ERRORS } from './authenticationErrors';
import { validatePassword, verifyTokenAndGetUser } from './authentication.utils';
import authenticationMethods from './authenticationMethods';
import authenticationDB from './authenticationDB';
import { EditUserRequest } from './authentication.types';

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
  const { refreshToken } = request.cookies;

  if (!refreshToken) {
    response.status(401).json({
      success: false,
      message: ERRORS.REFRESH_TOKEN_NOT_FOUND,
    });
    return;
  }

  try {
    const user = await verifyTokenAndGetUser(refreshToken, process.env.REFRESH_TOKEN_SECRET!);

    const isTokenValid = await authenticationMethods.verifyRefreshToken(user.id, refreshToken);
    if (!isTokenValid) {
      response.status(403);
    }

    const accessToken = jwt.sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET!, {
      expiresIn: '30s',
    });

    response.cookie('token', accessToken, { httpOnly: true });
    response.status(200).json({ message: 'Access token refreshed successfully', accessToken });
  } catch (error) {
    console.error('Error verifying token:', error);
    response.status(401).json({ error: 'Unauthorized' });
  }
};

const logoutUserAccount = async (request: Request, response: Response) => {
  try {
    const { refreshToken } = request.cookies;

    if (refreshToken) {
      await authenticationDB.removeRefreshTokenFromDatabase(refreshToken);
    }

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

const editUserAccount = async (request: Request, response: Response) => {
  const { email, password, currentPassword } = request.body as EditUserRequest;
  const { token } = request.cookies;

  if (!token) {
    response.status(401).json({
      success: false,
      message: ERRORS.ACCESS_TOKEN_NOT_FOUND,
    });
    return;
  }

  try {
    const user = await verifyTokenAndGetUser(token, process.env.ACCESS_TOKEN_SECRET!);

    const isPasswordValid = await validatePassword(currentPassword, user.hashed_password);

    if (!isPasswordValid) {
      response.status(401).json({
        success: false,
        message: 'Invalid current password',
      });
      return;
    }

    const { updates, emailChanged, passwordChanged } =
      await authenticationMethods.validateAndBuildUpdates(user, {
        email,
        password,
        currentPassword,
      });

    if (Object.keys(updates).length === 0) {
      response.status(400).json({
        success: false,
        message: 'No fields provided to update',
      });
      return;
    }

    const updatedUser = await authenticationDB.updateUserInDatabase(user.id, updates);

    if (!updatedUser) {
      response.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    await authenticationMethods.sendUpdateNotifications(
      user.email,
      email,
      emailChanged,
      passwordChanged,
    );

    response.status(200).json({
      success: true,
      message: 'User account updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user account:', error);
    response.status(500).json({
      success: false,
      message: 'Failed to update user account',
    });
  }
};

export default {
  registerUserAccount,
  loginUserAccount,
  refreshAccessToken,
  logoutUserAccount,
  editUserAccount,
};
