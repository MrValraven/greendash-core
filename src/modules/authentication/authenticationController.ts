import { Request, Response } from 'express';
import { ERRORS } from './authenticationErrors';
import { getUserFromToken } from './authentication.utils';
import authenticationMethods from './authenticationMethods';

interface FormattedError extends Error {
  statusCode?: number;
}

const registerUserAccount = async (request: Request, response: Response) => {
  const { email, password } = request.body;

  try {
    const user = await authenticationMethods.registerUserAccount(email, password);
    response.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    if (error instanceof Error) {
      const formattedError: FormattedError = {
        name: error.name,
        message: error.message,
        statusCode: 401,
      };
      console.error(error.message);
      response.status(500).json({
        success: false,
        formattedError,
      });
    }
  }
};

const verifyEmail = async (request: Request, response: Response) => {
  const { verificationToken } = request.query;

  if (!verificationToken) {
    response.status(400).json({
      success: false,
      message: 'Verification token is required',
    });
    return;
  }

  try {
    await authenticationMethods.verifyUserEmail(verificationToken as string);

    response.status(200).json({
      success: true,
      message: 'Email verified successfully',
    });
    return;
  } catch (error) {
    console.error(error);
    response.status(500).json({
      success: false,
      message: 'Internal server error',
    });
    return;
  }
};

const loginUserAccount = async (request: Request, response: Response) => {
  const { email, password } = request.body;

  try {
    const token = await authenticationMethods.loginUserAccount(email, password);
    response.cookie('token', token.accessToken, { httpOnly: true });
    response.cookie('refreshToken', token.refreshToken, { httpOnly: true });
    response.status(200).json({
      success: true,
      message: 'User logged in successfully',
      email,
      password,
      token,
    });
    return;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      response.status(500).json({
        success: false,
        error: error.message,
      });
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
    const accessToken = await authenticationMethods.refreshUserAccessToken(refreshToken);
    response.cookie('token', accessToken, { httpOnly: true });
    response.status(200).json({
      success: true,
      message: 'Access token refreshed successfully',
      accessToken,
    });
    return;
  } catch (error) {
    console.error('Error verifying token:', error);
    response.status(500).json({
      success: false,
      message: 'Internal server error',
    });
    return;
  }
};

const logoutUserAccount = async (request: Request, response: Response) => {
  try {
    response.clearCookie('token');
    response.clearCookie('refreshToken');
    response.status(200).json({
      success: true,
      message: 'User logged out successfully',
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      response.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
};

const requestPasswordReset = async (request: Request, response: Response) => {
  const { email } = request.body;

  try {
    await authenticationMethods.requestUserPasswordReset(email);

    response.status(200).json({
      success: true,
      message: 'Password reset email sent successfully',
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    response.status(500).json({
      success: false,
      message: 'Failed to process password reset request',
    });
  }
};

const resetPassword = async (request: Request, response: Response) => {
  const { passwordResetToken } = request.query;
  const { newPassword } = request.body;

  if (!passwordResetToken) {
    response.status(400).json({
      success: false,
      message: 'Password reset token is required',
    });
    return;
  }

  try {
    await authenticationMethods.resetUserPassword(passwordResetToken as string, newPassword);

    response.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    response.status(500).json({
      success: false,
      message: 'Failed to reset password',
    });
  }
};

const editUserAccount = async (request: Request, response: Response) => {
  const { field, value, currentPassword } = request.body;
  const { token } = request.cookies;

  if (!token) {
    response.status(401).json({
      success: false,
      message: ERRORS.ACCESS_TOKEN_NOT_FOUND,
    });
    return;
  }

  try {
    const user = await getUserFromToken(token, process.env.ACCESS_TOKEN_SECRET!);

    await authenticationMethods.updateUserAccount(user, {
      field,
      value,
      currentPassword,
    });

    response.status(200).json({
      success: true,
      message: 'User account updated successfully',
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
  verifyEmail,
  loginUserAccount,
  refreshAccessToken,
  logoutUserAccount,
  requestPasswordReset,
  resetPassword,
  editUserAccount,
};
