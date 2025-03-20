import { mailtrapClient, sender } from './mail.config';

export const sendPasswordResetEmail = async (email: string, passwordResetToken: string) => {
  const resetUrl = `http://localhost:3001/reset-password?passwordResetToken=${passwordResetToken}`;
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: 'Reset Your Password',
      html: `
        <h1>Password Reset Request</h1>
        <p>You requested to reset your password. Click the link below to set a new password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>If you didn't create an account, you can safely ignore this email.</p>
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
