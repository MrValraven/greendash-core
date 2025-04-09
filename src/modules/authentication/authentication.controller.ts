import { Request, Response } from 'express';
import { ERRORS } from './authentication.errors';
import authenticationMethods from './authentication.methods';
import { EditUserSchema } from './authentication.schemas';
import { sendCustomErrorResponse, sendHttpOnlySecureCookie } from './authentication.utils';
import { getGoogleOAuthURL } from '../oauth/oauth.utils';

const registerUserAccount = async (request: Request, response: Response) => {
  const { email, password } = request.body;

  try {
    const user = await authenticationMethods.registerUserAccount(email, password);
    response.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Registration error', error);
    if (error instanceof Error) {
      switch (error.message) {
        case ERRORS.EMAIL_IN_USE.message:
          sendCustomErrorResponse(response, 'EMAIL_IN_USE');
          break;
        default:
          sendCustomErrorResponse(response, 'INTERNAL_SERVER_ERROR');
          break;
      }
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
    console.error('Login error:', error);
    if (error instanceof Error) {
      switch (error.message) {
        case ERRORS.USER_NOT_FOUND.message:
          sendCustomErrorResponse(response, 'USER_NOT_FOUND');
          break;
        case ERRORS.INVALID_CREDENTIALS.message:
          sendCustomErrorResponse(response, 'INVALID_CREDENTIALS');
          break;
        default:
          sendCustomErrorResponse(response, 'INTERNAL_SERVER_ERROR');
          break;
      }
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
    console.error('Logout error:', error);
    sendCustomErrorResponse(response, 'INTERNAL_SERVER_ERROR');
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
    if (error instanceof Error) {
      switch (error.message) {
        case ERRORS.USER_NOT_FOUND.message:
          sendCustomErrorResponse(response, 'USER_NOT_FOUND');
          break;
        default:
          sendCustomErrorResponse(response, 'INTERNAL_SERVER_ERROR');
          break;
      }
    }
  }
};

const resetPassword = async (request: Request, response: Response) => {
  const { passwordResetToken } = request.query;
  const { newPassword } = request.body;

  if (!passwordResetToken) {
    sendCustomErrorResponse(response, 'VERIFICATION_TOKEN_REQUIRED');
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
    if (error instanceof Error) {
      switch (error.message) {
        case ERRORS.EXPIRED_PASSWORD_RESET_TOKEN.message:
          sendCustomErrorResponse(response, 'EXPIRED_PASSWORD_RESET_TOKEN');
          break;
        case ERRORS.USER_NOT_FOUND.message:
          sendCustomErrorResponse(response, 'USER_NOT_FOUND');
          break;
        default:
          sendCustomErrorResponse(response, 'INTERNAL_SERVER_ERROR');
          break;
      }
    }
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
    console.error('Update account error:', error);
    if (error instanceof Error) {
      switch (error.message) {
        case ERRORS.INVALID_TOKEN.message:
          sendCustomErrorResponse(response, 'INVALID_TOKEN');
          break;
        case ERRORS.USER_NOT_FOUND.message:
          sendCustomErrorResponse(response, 'USER_NOT_FOUND');
          break;
        default:
          sendCustomErrorResponse(response, 'INTERNAL_SERVER_ERROR');
          break;
      }
    }
  }
};

const getCurrentUserData = async (request: Request, response: Response) => {
  const { token } = request.cookies;

  try {
    const userData = await authenticationMethods.getCurrentUserData(token);

    response.status(200).json({
      success: true,
      data: userData,
    });
  } catch (error) {
    console.error('GetCurrentUserData error:', error);
    if (error instanceof Error) {
      switch (error.message) {
        case ERRORS.INVALID_TOKEN.message:
          sendCustomErrorResponse(response, 'INVALID_TOKEN');
          break;
        case ERRORS.USER_NOT_FOUND.message:
          sendCustomErrorResponse(response, 'USER_NOT_FOUND');
          break;
        default:
          sendCustomErrorResponse(response, 'INTERNAL_SERVER_ERROR');
          break;
      }
    }
  }
};

const startGoogleLogin = async (request: Request, response: Response) => {
  try {
    const googleAuthURL = getGoogleOAuthURL();

    if (!googleAuthURL) {
      sendCustomErrorResponse(response, 'GOOGLE_AUTH_URL_NOT_FOUND');
      return;
    }

    response.redirect(googleAuthURL);
  } catch (error) {
    console.error('Google login error:', error);
    if (error instanceof Error) {
      switch (error.message) {
        case ERRORS.GOOGLE_AUTH_URL_NOT_FOUND.message:
          sendCustomErrorResponse(response, 'GOOGLE_AUTH_URL_NOT_FOUND');
          break;
        default:
          sendCustomErrorResponse(response, 'INTERNAL_SERVER_ERROR');
          break;
      }
    }
  }
};

const completeGoogleLogin = async (request: Request, response: Response) => {
  const { code } = request.query;

  if (!code) {
    sendCustomErrorResponse(response, 'GOOGLE_AUTH_CODE_REQUIRED');
    return;
  }

  try {
    const { accessToken, refreshToken } = await authenticationMethods.authenticateWithGoogle(
      code as string,
    );

    sendHttpOnlySecureCookie(response, 'token', accessToken);
    sendHttpOnlySecureCookie(response, 'refreshToken', refreshToken);

    //redirect the user to client url

    response.status(200).json({
      success: true,
      message: 'User logged in successfully with Google',
    });
    return;
  } catch (error) {
    console.error('Google login error::', error);
    if (error instanceof Error) {
      switch (error.message) {
        case ERRORS.GOOGLE_EMAIL_NOT_VERIFIED.message:
          sendCustomErrorResponse(response, 'GOOGLE_EMAIL_NOT_VERIFIED');
          break;
        case ERRORS.USER_NOT_FOUND.message:
          sendCustomErrorResponse(response, 'USER_NOT_FOUND');
          break;
        case ERRORS.EMAIL_IN_USE.message:
          sendCustomErrorResponse(response, 'EMAIL_IN_USE');
          break;
        default:
          sendCustomErrorResponse(response, 'INTERNAL_SERVER_ERROR');
          break;
      }
    }
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
  getCurrentUserData,
  startGoogleLogin,
  completeGoogleLogin,
};
