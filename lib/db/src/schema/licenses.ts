import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const licensesTable = pgTable("licenses", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  duration: text("duration").notNull(), // 1day | 7days | 30days | permanent
  status: text("status").notNull().default("active"), // active | used | expired | revoked
  username: text("username"),
  deviceInfo: text("device_info"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  activatedAt: timestamp("activated_at"),
  expiresAt: timestamp("expires_at"),
  notes: text("notes"),
});

export const insertLicenseSchema = createInsertSchema(licensesTable).omit({ id: true, createdAt: true });
export type InsertLicense = z.infer<typeof insertLicenseSchema>;
export type License = typeof licensesTable.$inferSelect;
