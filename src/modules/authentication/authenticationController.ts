import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { ERRORS } from './authenticationErrors';
import { generateToken, hashPassword } from './authentication.utils';
import authenticationMethods from './authenticationMethods';
import authenticationDB from './authenticationDB';
import { sendPasswordResetEmail } from '../mail/mailService';

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
    const decoded = jwt.verify(verificationToken as string, process.env.VERIFY_TOKEN_SECRET!) as {
      userId: number;
    };

    const user = await authenticationDB.getUserFromDatabase('id', decoded.userId);

    if (!user) {
      response.status(404).json({
        success: false,
        message: ERRORS.USER_NOT_FOUND,
      });
      return;
    }

    if (user!.email_verified) {
      response.status(400).json({
        success: false,
        message: 'Email already verified',
      });
      return;
    }

    await authenticationDB.updateUserInDatabase(user!.id, {
      email_verified: true,
    });

    response.status(200).json({
      success: true,
      message: 'Email verified successfully',
    });
    return;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      response.status(401).json({
        success: false,
        message: ERRORS.EXPIRED_VERIFICATION_TOKEN,
      });
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      response.status(401).json({
        success: false,
        message: ERRORS.INVALID_VERIFICATION_TOKEN,
      });
      return;
    }

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
  const cookies = request.cookies;

  if (!cookies?.refreshToken) {
    response.status(401).json({
      success: false,
      message: ERRORS.REFRESH_TOKEN_NOT_FOUND,
    });
    return;
  }

  const refreshToken = cookies.refreshToken;

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_TOKEN!) as {
      userId: number;
    };

    const storedToken = await authenticationDB.getRefreshTokenFromDatabase(
      decoded.userId,
      refreshToken,
    );

    if (!storedToken) {
      response.status(401).json({
        success: false,
        message: ERRORS.REFRESH_TOKEN_NOT_FOUND,
      });
      return;
    }

    if (storedToken !== refreshToken) {
      response.status(401).json({
        success: false,
        message: ERRORS.INVALID_REFRESH_TOKEN,
      });
      return;
    }

    const accessToken = generateToken(decoded.userId, process.env.ACCESS_TOKEN_SECRET!, '30s');

    response.cookie('token', accessToken, { httpOnly: true });
    response.status(200).json({
      success: true,
      message: 'Access token refreshed successfully',
      accessToken,
    });
    return;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      response.status(401).json({
        success: false,
        message: ERRORS.EXPIRED_REFRESH_TOKEN,
      });
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      response.status(401).json({
        success: false,
        message: ERRORS.INVALID_REFRESH_TOKEN,
      });
      return;
    }

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
    const user = await authenticationDB.getUserFromDatabase('email', email);

    if (!user) {
      response.status(404).json({
        success: false,
        message: ERRORS.USER_NOT_FOUND,
      });
      return;
    }

    const passwordResetToken = generateToken(
      user.id,
      process.env.PASSWORD_RESET_TOKEN_SECRET!,
      '1h',
    );

    await sendPasswordResetEmail(email, passwordResetToken);

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

  if (!newPassword) {
    response.status(400).json({
      success: false,
      message: 'New Password is required',
    });
    return;
  }

  try {
    const decoded = jwt.verify(
      passwordResetToken as string,
      process.env.PASSWORD_RESET_TOKEN_SECRET!,
    ) as {
      userId: number;
    };

    const user = await authenticationDB.getUserFromDatabase('id', decoded.userId);

    if (!user) {
      response.status(404).json({
        success: false,
        message: ERRORS.USER_NOT_FOUND,
      });
      return;
    }

    const hashedPassword = await hashPassword(newPassword);

    await authenticationDB.updateUserInDatabase(user.id, {
      hashed_password: hashedPassword,
    });

    response.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      response.status(400).json({
        success: false,
        message: ERRORS.EXPIRED_PASSWORD_RESET_TOKEN,
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      response.status(401).json({
        success: false,
        message: ERRORS.INVALID_PASSWORD_RESET_TOKEN,
      });
      return;
    }

    console.error('Password reset error:', error);
    response.status(500).json({
      success: false,
      message: 'Failed to reset password',
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
};
