import { Request, Response } from 'express';
import { ERRORS } from './authentication.errors';
import authenticationMethods from './authentication.methods';
import { EditUserSchema } from './authentication.schemas';
import { sendCustomErrorResponse, sendHttpOnlySecureCookie } from './authentication.utils';

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
    sendCustomErrorResponse(response, 'VERIFICATION_TOKEN_REQUIRED');
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
    if (error instanceof Error) {
      switch (error.message) {
        case ERRORS.EMAIL_ALREADY_VERIFIED.message:
          sendCustomErrorResponse(response, 'EMAIL_ALREADY_VERIFIED');
          break;
        default:
          sendCustomErrorResponse(response, 'INTERNAL_SERVER_ERROR');
          break;
      }
    }
  }
};

const loginUserAccount = async (request: Request, response: Response) => {
  const { email, password } = request.body;

  try {
    const token = await authenticationMethods.loginUserAccount(email, password);

    sendHttpOnlySecureCookie(response, 'token', token.accessToken);
    sendHttpOnlySecureCookie(response, 'refreshToken', token.refreshToken);

    response.status(200).json({
      success: true,
      message: 'User logged in successfully',
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
    sendCustomErrorResponse(response, 'REFRESH_TOKEN_REQUIRED');
    return;
  }

  try {
    const accessToken = await authenticationMethods.refreshUserAccessToken(refreshToken);

    sendHttpOnlySecureCookie(response, 'token', accessToken);
    response.status(200).json({
      success: true,
      message: 'Access token refreshed successfully',
      accessToken,
    });
    return;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    if (error instanceof Error) {
      switch (error.message) {
        case ERRORS.USER_NOT_FOUND.message:
          sendCustomErrorResponse(response, 'USER_NOT_FOUND');
          break;
        case ERRORS.INVALID_REFRESH_TOKEN.message:
          sendCustomErrorResponse(response, 'INVALID_REFRESH_TOKEN');
          break;
        default:
          sendCustomErrorResponse(response, 'INTERNAL_SERVER_ERROR');
          break;
      }
    }
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
  const { token } = request.cookies;

  try {
    await authenticationMethods.updateUserAccount(token, request.body as EditUserSchema);

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
