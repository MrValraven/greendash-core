import { mailtrapClient, sender } from './mail.config';

export const sendVerificationEmail = async (email: string, verificationCode: string) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: 'Verify your email address',
      text: `Your verification code is: ${verificationCode}`,
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
