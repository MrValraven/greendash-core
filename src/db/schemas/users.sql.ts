import { pgEnum, pgTable as table } from 'drizzle-orm/pg-core';
import { integer, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';

import { timestamps } from './columns.helpers';

export const rolesEnum = pgEnum('roles', ['user', 'admin', 'organization']);
export const accountStatusEnum = pgEnum('account_status', [
  'pending',
  'active',
  'inactive',
  'banned',
]);
export const subscriptionTierEnum = pgEnum('subscription_tier', ['free', 'pro', 'enterprise']);

export const usersTable = table('users', {
  // User Information
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 256 }),
  email: varchar('email').notNull(),
  hashed_password: varchar('hashed_password').notNull(),
  account_status: accountStatusEnum().default('pending'),
  email_verified: boolean('email_verified').default(false),
  role: rolesEnum().notNull().default('user'),

  // Security & Authentication
  failed_login_attempts: integer('failed_login_attempts').default(0),
  locked_until: timestamp('locked_until'),
  password_reset_token: varchar('password_reset_token', { length: 512 }),
  password_reset_expires: timestamp('password_reset_expires'),
  verification_code: varchar('verification_code', { length: 6 }),
  verification_code_expires: timestamp('verification_code_expires').notNull(),
  refresh_token: varchar('refresh_token', { length: 512 }),
  two_factor_auth_enabled: boolean('two_factor_auth_enabled').default(false),

  // Monetization & Usage Tracking
  subscription_tier: subscriptionTierEnum('subscription_tier').default('free'),
  subscription_expires_at: timestamp('subscription_expires_at'),

  // GDPR & Legal
  gdpr_consent_given_at: timestamp('gdpr_consent_given_at'),
  data_retention_period: integer('data_retention_period').default(365),
  export_requested_at: timestamp('export_requested_at'),

  // Tracking User Activity
  last_login: timestamp('last_login'),
  terms_accepted_at: timestamp('terms_accepted_at'),
  ...timestamps,
});
