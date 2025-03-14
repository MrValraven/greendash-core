import { pgTable as table, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { usersTable } from './users.sql';

export const refreshTokensTable = table('refresh_tokens', {
  id: serial().primaryKey(),
  user_id: integer('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  token: text('token').notNull(),
  expires_at: timestamp('expires_at').notNull(),
  created_at: timestamp('created_at').defaultNow(),
});
