export const STATUS_CODES = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

export const ERRORS = {
  INVALID_TOKEN: {
    statusCode: STATUS_CODES.UNAUTHORIZED,
    message: 'Invalid token',
  },
  INVALID_ACCESS_TOKEN: {
    statusCode: STATUS_CODES.UNAUTHORIZED,
    message: 'Invalid access token',
  },
  INVALID_REFRESH_TOKEN: {
    statusCode: STATUS_CODES.UNAUTHORIZED,
    message: 'Invalid refresh token',
  },
  INVALID_VERIFICATION_TOKEN: {
    statusCode: STATUS_CODES.UNAUTHORIZED,
    message: 'Invalid verification token',
  },
  INVALID_PASSWORD_RESET_TOKEN: {
    statusCode: STATUS_CODES.UNAUTHORIZED,
    message: 'Invalid password reset token',
  },

  EXPIRED_TOKEN: {
    statusCode: STATUS_CODES.UNAUTHORIZED,
    message: 'Token has expired',
  },
  EXPIRED_ACCESS_TOKEN: {
    statusCode: STATUS_CODES.UNAUTHORIZED,
    message: 'Access token has expired',
  },
  EXPIRED_REFRESH_TOKEN: {
    statusCode: STATUS_CODES.UNAUTHORIZED,
    message: 'Refresh token has expired',
  },
  EXPIRED_VERIFICATION_TOKEN: {
    statusCode: STATUS_CODES.UNAUTHORIZED,
    message: 'Verification token has expired',
  },
  EXPIRED_PASSWORD_RESET_TOKEN: {
    statusCode: STATUS_CODES.UNAUTHORIZED,
    message: 'Password reset token has expired',
  },

  VERIFICATION_TOKEN_REQUIRED: {
    statusCode: STATUS_CODES.BAD_REQUEST,
    message: 'Verification token is required',
  },
  INVALID_CREDENTIALS: {
    statusCode: STATUS_CODES.UNAUTHORIZED,
    message: 'Invalid credentials',
  },

  EMAIL_IN_USE: {
    statusCode: STATUS_CODES.CONFLICT,
    message: 'Email is already in use',
  },
  EMAIL_ALREADY_VERIFIED: {
    statusCode: STATUS_CODES.BAD_REQUEST,
    message: 'Email already verified',
  },

  USER_NOT_FOUND: {
    statusCode: STATUS_CODES.NOT_FOUND,
    message: 'User not found',
  },

  INTERNAL_SERVER_ERROR: {
    statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR,
    message: 'Internal server error',
  },

  REFRESH_TOKEN_REQUIRED: {
    statusCode: STATUS_CODES.BAD_REQUEST,
    message: 'Refresh token is required',
  },
};
