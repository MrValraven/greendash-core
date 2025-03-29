import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';

config();

export const db = drizzle({
  connection: {
    connectionString: process.env.DATABASE_URL!,
    ssl: true,
  },
});
