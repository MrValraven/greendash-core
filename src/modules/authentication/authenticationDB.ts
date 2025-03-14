import { eq, and, lt } from 'drizzle-orm';
import { db } from '../../db';
import { usersTable } from '../../db/schemas/users.sql';
import { refreshTokensTable } from '../../db/schemas/refreshTokens.sql';
import { User, RefreshToken } from './authentication.types';

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
      role: usersTable.role,
    });

  return user[0];
};

const getUserFromDatabase = async (email: string): Promise<User | undefined> => {
  const userFromDB = await db
    .select({
      id: usersTable.id,
      email: usersTable.email,
      hashed_password: usersTable.hashed_password,
      role: usersTable.role,
    })
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  return userFromDB[0];
};

const storeRefreshTokenInDatabase = async (
  userId: number,
  token: string,
  expiresAt: Date,
): Promise<RefreshToken | undefined> => {
  const refreshToken = await db
    .insert(refreshTokensTable)
    .values({
      user_id: userId,
      token: token,
      expires_at: expiresAt,
    })
    .returning({
      id: refreshTokensTable.id,
      user_id: refreshTokensTable.user_id,
      token: refreshTokensTable.token,
      expires_at: refreshTokensTable.expires_at,
      created_at: refreshTokensTable.created_at,
    });

  return refreshToken[0];
};

const getRefreshTokenFromDatabase = async (
  userId: number,
  token: string,
): Promise<RefreshToken | undefined> => {
  const tokenRecord = await db
    .select()
    .from(refreshTokensTable)
    .where(and(eq(refreshTokensTable.user_id, userId), eq(refreshTokensTable.token, token)))
    .limit(1);

  return tokenRecord[0];
};

const removeRefreshTokenFromDatabase = async (refreshToken: string): Promise<number> => {
  const deletedTokens = await db
    .delete(refreshTokensTable)
    .where(eq(refreshTokensTable.token, refreshToken))
    .returning({ deletedId: refreshTokensTable.id });

  return deletedTokens.length;
};

const removeAllUserRefreshTokensFromDatabase = async (userId: number): Promise<number> => {
  const deletedTokens = await db
    .delete(refreshTokensTable)
    .where(eq(refreshTokensTable.user_id, userId))
    .returning({ deletedId: refreshTokensTable.id });

  return deletedTokens.length; // Return the number of deleted tokens
};

export default {
  getUserFromDatabase,
  createUserInDatabase,
  storeRefreshTokenInDatabase,
  getRefreshTokenFromDatabase,
  removeRefreshTokenFromDatabase,
  removeAllUserRefreshTokensFromDatabase,
};
