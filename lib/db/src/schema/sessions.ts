import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const sessionsTable = pgTable("sessions", {
  sessionId: text("session_id").primaryKey(),
  lastSeen: timestamp("last_seen").notNull().defaultNow(),
});

export type Session = typeof sessionsTable.$inferSelect;
