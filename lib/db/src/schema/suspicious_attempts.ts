import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const suspiciousAttemptsTable = pgTable("suspicious_attempts", {
  id: serial("id").primaryKey(),
  key: text("key").notNull(),
  originalDevice: text("original_device"),
  originalUsername: text("original_username"),
  attemptDevice: text("attempt_device"),
  attemptUsername: text("attempt_username"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type SuspiciousAttempt = typeof suspiciousAttemptsTable.$inferSelect;
