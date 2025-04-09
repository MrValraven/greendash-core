import { Address } from 'mailtrap/dist';
import { sender, mailClient } from './mail.config';

export const sendEmail = async (
  recipients: Address[],
  emailSubject: string,
  emailBody: string,
  emailCategory: string,
) => {
  try {
    const response = await mailClient.send({
      from: sender,
      to: recipients,
      subject: emailSubject,
      html: emailBody,
      category: emailCategory,
    });

    console.log(`${emailCategory} email sent successfully:`, response);
  } catch (error) {
    console.error('Mail service Error Details:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      sender,
      recipients,
      apiTokenExists: !!process.env.MAIL_SERVICE_TOKEN,
    });

    throw new Error(
      `Failed to send ${emailCategory} email: ${
        error instanceof Error ? error.message : 'Unknown error occurred'
      }. Please check Mail service credentials and try again.`,
    );
  }
};
