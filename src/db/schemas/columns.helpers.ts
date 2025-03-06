import { timestamp } from "drizzle-orm/pg-core";

const timestamps = {
    updated_at: timestamp('updated_at'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    deleted_at: timestamp('deleted_at'),
};

export { timestamps };
  