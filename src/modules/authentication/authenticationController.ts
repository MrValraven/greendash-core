import jwt, { decode } from 'jsonwebtoken';
import { Request, Response } from 'express';
import { ERRORS } from './authenticationErrors';
import { hashPassword, validatePassword } from './authentication.utils';
import {
  sendEmailAndPasswordChangeNotification,
  sendEmailChangeNotification,
  sendPasswordChangeNotification,
} from '../mail/mailService';
import authenticationMethods from './authenticationMethods';
import authenticationDB from './authenticationDB';

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

    const accessToken = jwt.sign({ userId: decoded.userId }, process.env.ACCESS_TOKEN_SECRET!, {
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
  const { email, password, currentPassword } = request.body;
  const cookies = request.cookies;

  if (!cookies?.token) {
    response.status(401).json({
      success: false,
      message: ERRORS.ACCESS_TOKEN_NOT_FOUND,
    });
    return;
  }

  const token = cookies.token;

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
      userId: number;
    };

    const user = await authenticationDB.getUserFromDatabase('id', decoded.userId);

    if (!user) {
      response.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    const isPasswordValid = await validatePassword(currentPassword, user.hashed_password);

    if (!isPasswordValid) {
      response.status(401).json({
        success: false,
        message: 'Invalid current password',
      });
      return;
    }

    const updates: Partial<{ email: string; hashed_password: string }> = {};
    let emailChanged = false;
    let passwordChanged = false;

    if (email) {
      if (email === user.email) {
        return response.status(400).json({
          success: false,
          message: 'The new email cannot be the same as the current email',
        });
      }
      updates.email = email;
      emailChanged = true;
    }

    if (password) {
      const isSamePassword = await validatePassword(password, user.hashed_password);
      if (isSamePassword) {
        return response.status(400).json({
          success: false,
          message: 'The new password cannot be the same as the current password',
        });
      }
      updates.hashed_password = await hashPassword(password);
      passwordChanged = true;
    }

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

    if (emailChanged && passwordChanged) {
      await sendEmailAndPasswordChangeNotification(user.email, email!);
    } else if (emailChanged) {
      await sendEmailChangeNotification(user.email, email!);
    } else if (passwordChanged) {
      await sendPasswordChangeNotification(user.email);
    }

    response.status(200).json({
      success: true,
      message: 'User account updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      response.status(401).json({
        success: false,
        message: ERRORS.EXPIRED_ACCESS_TOKEN,
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      response.status(401).json({
        success: false,
        message: ERRORS.INVALID_ACCESS_TOKEN,
      });
      return;
    }

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
