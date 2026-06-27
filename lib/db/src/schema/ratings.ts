import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";

export const ratingsTable = pgTable("ratings", {
  id: serial("id").primaryKey(),
  stars: integer("stars").notNull(),
  comment: text("comment"),
  page: text("page").notNull().default("general"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Rating = typeof ratingsTable.$inferSelect;
