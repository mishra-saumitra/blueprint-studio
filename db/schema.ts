import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const aiUsage = sqliteTable('ai_usage', {
  bucket: text('bucket').primaryKey(),
  count: integer('count').notNull().default(0),
});
