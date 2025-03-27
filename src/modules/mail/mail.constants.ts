export const BASE_URL = 'http://localhost:3001';

export const verificationEmailCategories = {
  emailVerification: {
    subject: 'Verify your email address',
    category: 'Email Verification',
    path: '/verify-email?verificationToken=',
    body: `
          <h1>Welcome to Our Service!</h1>
          <p>Please verify your email address by clicking the link below:</p>
          <a href="$url">Verify Email</a>
          <p>If you didn't create an account, you can safely ignore this email.</p>
        `,
  },
  passwordReset: {
    subject: 'Reset Your Password',
    category: 'Password Reset',
    path: '/reset-password?passwordResetToken=',
    body: `
          <h1>Password Reset Request</h1>
          <p>You requested to reset your password. Click the link below to set a new password:</p>
          <a href="$url">Reset Password</a>
          <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
        `,
  },
};

export const notificationEmailCategories = {
  passwordChange: {
    subject: 'Password Change Notification',
    category: 'Password Change Notification',
    body: `
      <h1>Password Change Notification</h1>
      <p>Hello,</p>
      <p>We wanted to let you know that your password has been successfully changed.</p>
      <p>If you did not make this change, please contact our support team immediately.</p>
      <p>Thank you,</p>
      <p>The GreenDash Team</p>
    `,
  },
  emailChange: {
    subject: 'Your Email Address Has Been Changed',
    category: 'Email Change Notification',
    body: `
      <h1>Email Change Notification</h1>
      <p>Hello,</p>
      <p>We wanted to let you know that your email address has been successfully changed to <strong>$newEmail</strong>.</p>
      <p>If you did not make this change, please contact our support team immediately.</p>
      <p>Thank you,</p>
      <p>The GreenDash Team</p>
    `,
  },
};
