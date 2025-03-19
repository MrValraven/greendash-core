import { MailtrapClient } from 'mailtrap';
import dotenv from 'dotenv';

dotenv.config();

export const mailtrapClient = new MailtrapClient({
  token: process.env.MAIL_SERVICE_TOKEN!,
});

export const sender = {
  email: 'hello@demomailtrap.co',
  name: 'Mailtrap Test',
};
