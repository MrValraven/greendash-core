import { verificationEmailCategories, notificationEmailCategories } from './mail.constants.js';

export type VerificationEmailCategory = keyof typeof verificationEmailCategories;

export type NotificationEmailCategory = keyof typeof notificationEmailCategories;
