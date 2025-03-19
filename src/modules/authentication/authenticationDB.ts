import { eq, and } from 'drizzle-orm';
import { db } from '../../db';
import { usersTable } from '../../db/schemas/users.sql';
import { User } from './authentication.types';

const createUserInDatabase = async (
  email: string,
  hashedPassword: string,
  verificationCode: string,
  verificationCodeExpires: Date,
): Promise<User> => {
  const user = await db
    .insert(usersTable)
    .values({
      email: email,
      hashed_password: hashedPassword,
      verification_code: verificationCode,
      verification_code_expires: verificationCodeExpires,
    })
    .returning({
      id: usersTable.id,
      email: usersTable.email,
      hashed_password: usersTable.hashed_password,
      verification_code: usersTable.verification_code,
      verification_code_expires: usersTable.verification_code_expires,
      email_verified: usersTable.email_verified,
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
      verification_code: usersTable.verification_code,
      verification_code_expires: usersTable.verification_code_expires,
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
};
