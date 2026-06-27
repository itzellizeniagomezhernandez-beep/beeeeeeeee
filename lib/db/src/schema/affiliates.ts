import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

export const affiliatesTable = pgTable("affiliates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  uses: integer("uses").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Affiliate = typeof affiliatesTable.$inferSelect;
