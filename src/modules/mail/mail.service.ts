import { sendEmail } from './mail.utils';
import { VerificationEmailCategory, NotificationEmailCategory } from './mail.types';
import { BASE_API_URL } from '../../constants/app.constants';
import { verificationEmailCategories, notificationEmailCategories } from './mail.constants';

const sendVerificationEmail = async (
  userEmail: string,
  emailCategory: VerificationEmailCategory,
  token: string,
) => {
  const { subject, category, path, body } = verificationEmailCategories[emailCategory];
  const url = `${BASE_API_URL}${path}${token}`;
  const recipients = [{ email: userEmail }];
  const emailBody = body.replace('$url', url);

  await sendEmail(recipients, subject, emailBody, category);
};

const sendNotificationEmail = async (
  userEmail: string,
  emailCategory: NotificationEmailCategory,
  newEmail?: string,
) => {
  const { subject, category, body } = notificationEmailCategories[emailCategory];
  const recipients = [{ email: userEmail }];
  const emailBody = newEmail ? body.replace('$newEmail', newEmail) : body;

  await sendEmail(recipients, subject, emailBody, category);
};

export default {
  sendVerificationEmail,
  sendNotificationEmail,
};
