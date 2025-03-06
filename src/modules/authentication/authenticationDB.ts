import { eq } from 'drizzle-orm';

import { db } from '../../db';
import { usersTable } from '../../db/schemas/users.sql';
import { User } from './authentication.types';

const createUserInDatabase = async (email: string, hashedPassword: string): Promise<User> => {
  const user = await db
      .insert(usersTable)
      .values({
      email: email,
      hashed_password: hashedPassword,
  }).returning({
      id: usersTable.id,
      email: usersTable.email,
      hashed_password: usersTable.hashed_password,
      role: usersTable.role,
  });
  
  return user[0];
}

const getUserFromDatabase = async (email: string): Promise<User | undefined> => {

  const userFromDB = await db.select({
    id: usersTable.id,
    email: usersTable.email,
    hashed_password: usersTable.hashed_password,
    role: usersTable.role
  }).from(usersTable).where(eq(usersTable.email, email)).limit(1);

  return userFromDB[0];
}

export default { getUserFromDatabase, createUserInDatabase };