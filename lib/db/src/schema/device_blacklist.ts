import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const deviceBlacklistTable = pgTable("device_blacklist", {
  id: serial("id").primaryKey(),
  deviceId: text("device_id").notNull().unique(),
  reason: text("reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type DeviceBlacklist = typeof deviceBlacklistTable.$inferSelect;
