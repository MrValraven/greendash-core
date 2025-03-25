import { mailClient, sender } from './mail.config';

const sendVerificationEmail = async (email: string, verificationToken: string) => {
  const verificationUrl = `http://localhost:3001/verify-email?verificationToken=${verificationToken}`;
  const recipient = [{ email }];

  try {
    const response = await mailClient.send({
      from: sender,
      to: recipient,
      subject: 'Verify your email address',
      html: `
        <h1>Welcome to Our Service!</h1>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>If you didn't create an account, you can safely ignore this email.</p>
      `,
      category: 'Email Verification',
    });

    console.log('Verification email sent successfully:', response);
  } catch (error) {
    console.error('Mailtrap Error Details:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      sender,
      recipient,
      apiTokenExists: !!process.env.MAILTRAP_API_TOKEN,
    });

    throw new Error(
      `Failed to send verification email: ${
        error instanceof Error ? error.message : 'Unknown error occurred'
      }. Please check Mailtrap credentials and try again.`,
    );
  }
};

const sendPasswordResetEmail = async (email: string, passwordResetToken: string) => {
  const resetUrl = `http://localhost:3001/reset-password?passwordResetToken=${passwordResetToken}`;
  const recipient = [{ email }];

  try {
    const response = await mailClient.send({
      from: sender,
      to: recipient,
      subject: 'Reset Your Password',
      html: `
        <h1>Password Reset Request</h1>
        <p>You requested to reset your password. Click the link below to set a new password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
      `,
      category: 'Password Reset',
    });

    console.log('Password reset email sent successfully:', response);
  } catch (error) {
    console.error('Mailtrap Error Details:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      sender,
      recipient,
      apiTokenExists: !!process.env.MAILTRAP_API_TOKEN,
    });

    throw new Error(
      `Failed to send password reset email: ${
        error instanceof Error ? error.message : 'Unknown error occurred'
      }. Please check Mailtrap credentials and try again.`,
    );
  }
};

const sendPasswordChangeNotification = async (email: string) => {
  const recipient = [{ email }];

  try {
    const response = await mailClient.send({
      from: sender,
      to: recipient,
      subject: 'Verify your email address',
      html: `
        <h1>Password Change Notification</h1>
        <p>Hello,</p>
        <p>We wanted to let you know that your password has been successfully changed.</p>
        <p>If you did not make this change, please contact our support team immediately.</p>
        <p>Thank you,</p>
        <p>The GreenDash Team</p>
      `,
      category: 'Password Change Notification',
    });

    console.log('Password change email sent successfully:', response);
  } catch (error) {
    console.error('Failed to send password change email:', error);
    throw new Error('Failed to send password change email');
  }
};

const sendEmailChangeNotification = async (email: string, newEmail: string) => {
  const recipient = [{ email }];

  try {
    const response = await mailClient.send({
      from: sender,
      to: recipient,
      subject: 'Your Email Address Has Been Changed',
      html: `
          <h1>Email Change Notification</h1>
          <p>Hello,</p>
          <p>We wanted to let you know that your email address has been successfully changed to <strong>${newEmail}</strong>.</p>
          <p>If you did not make this change, please contact our support team immediately.</p>
          <p>Thank you,</p>
          <p>The GreenDash Team</p>
        `,
      category: 'Email Change Notification',
    });

    console.log('Email change notification sent successfully:', response);
  } catch (error) {
    console.error('Failed to send email change notification:', error);
    throw new Error('Failed to send email change notification.');
  }
};

const sendEmailAndPasswordChangeNotification = async (email: string, newEmail: string) => {
  const recipient = [{ email }];

  try {
    const response = await mailClient.send({
      from: sender,
      to: recipient,
      subject: 'Your Email and Password Have Been Changed',
      html: `
          <h1>Email and Password Change Notification</h1>
          <p>Hello,</p>
          <p>We wanted to let you know that both your email and password have been successfully changed.</p>
          <p>Your new email address is: <strong>${newEmail}</strong>.</p>
          <p>If you did not make these changes, please contact our support team immediately.</p>
          <p>Thank you,</p>
          <p>The GreenDash Team</p>
        `,
      category: 'Email and Password Change Notification',
    });

    console.log('Email and password change notification sent successfully:', response);
  } catch (error) {
    console.error('Failed to send email and password change notification:', error);
    throw new Error('Failed to send email and password change notification.');
  }
};

export default {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendEmailAndPasswordChangeNotification,
  sendEmailChangeNotification,
  sendPasswordChangeNotification,
};
