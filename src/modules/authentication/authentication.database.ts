import { eq, and } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { usersTable } from '../../db/schemas/users.sql.js';
import { User, UserField, UserFieldValue } from './authentication.types.js';

const createUserInDatabase = async (
  email: string,
  hashedPassword: string,
): Promise<Omit<User, 'refresh_token'>> => {
  const user = await db
    .insert(usersTable)
    .values({
      email: email,
      hashed_password: hashedPassword,
    })
    .returning({
      id: usersTable.id,
      email: usersTable.email,
      hashed_password: usersTable.hashed_password,
      email_verified: usersTable.email_verified,
      role: usersTable.role,
    });

  return user[0];
};

const getUserFromDatabase = async (
  field: UserField,
  value: UserFieldValue,
): Promise<User | undefined> => {
  const userFromDB = await db
    .select({
      id: usersTable.id,
      email: usersTable.email,
      hashed_password: usersTable.hashed_password,
      email_verified: usersTable.email_verified,
      role: usersTable.role,
      refresh_token: usersTable.refresh_token,
    })
    .from(usersTable)
    .where(eq(usersTable[field], value))
    .limit(1);

  return userFromDB[0];
};

const updateUserInDatabase = async (
  userId: number,
  updates: Partial<Omit<User, 'id'>>,
): Promise<Omit<User, 'hashed_password' | 'refresh_token'> | undefined> => {
  if (Object.keys(updates).length === 0) {
    throw new Error('No updates provided.');
  }

  const updatedUser = await db
    .update(usersTable)
    .set(updates)
    .where(eq(usersTable.id, userId))
    .returning({
      id: usersTable.id,
      email: usersTable.email,
      email_verified: usersTable.email_verified,
      role: usersTable.role,
    });

  return updatedUser[0];
};

const storeRefreshTokenInDatabase = async (
  userId: number,
  token: string,
): Promise<string | null> => {
  const user = await db
    .update(usersTable)
    .set({
      refresh_token: token,
    })
    .where(eq(usersTable.id, userId))
    .returning({
      refresh_token: usersTable.refresh_token,
    });

  return user[0]?.refresh_token;
};

export default {
  getUserFromDatabase,
  createUserInDatabase,
  storeRefreshTokenInDatabase,
  updateUserInDatabase,
};
