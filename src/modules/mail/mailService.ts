import { mailtrapClient, sender } from './mail.config';

export const sendVerificationEmail = async (email: string, verificationToken: string) => {
  const verificationUrl = `http://localhost:3001/verify-email?verificationToken=${verificationToken}`;
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
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
