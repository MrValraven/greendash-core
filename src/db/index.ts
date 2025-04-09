import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { usersTable } from './schemas/users.sql';

config();

export const db = drizzle({
  connection: {
    connectionString: process.env.DATABASE_URL!,
    ssl: true,
  },
});

export const checkDbConnection = async () => {
  try {
    await db.select().from(usersTable).limit(1);
    console.log('Database connection successful');
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};
