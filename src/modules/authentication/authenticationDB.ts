import { eq, and } from 'drizzle-orm';
import { db } from '../../db';
import { usersTable } from '../../db/schemas/users.sql';
import { User, UserField, UserFieldValue } from './authentication.types';

const createUserInDatabase = async (email: string, hashedPassword: string): Promise<User> => {
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
    })
    .from(usersTable)
    .where(eq(usersTable[field], value))
    .limit(1);

  return userFromDB[0];
};

const updateUserInDatabase = async (
  userId: number,
  updates: Partial<Omit<User, 'id'>>,
): Promise<Omit<User, 'hashed_password'> | undefined> => {
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

const getRefreshTokenFromDatabase = async (
  userId: number,
  token: string,
): Promise<string | null> => {
  const user = await db
    .select({ refresh_token: usersTable.refresh_token })
    .from(usersTable)
    .where(and(eq(usersTable.id, userId), eq(usersTable.refresh_token, token)))
    .limit(1);

  return user[0]?.refresh_token;
};

export default {
  getUserFromDatabase,
  createUserInDatabase,
  storeRefreshTokenInDatabase,
  getRefreshTokenFromDatabase,
  updateUserInDatabase,
};
