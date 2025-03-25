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
  verifyEmail,
  loginUserAccount,
  refreshAccessToken,
  logoutUserAccount,
  requestPasswordReset,
  resetPassword,
  editUserAccount,
};
