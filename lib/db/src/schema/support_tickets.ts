import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const supportTicketsTable = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  username: text("username"),
  licenseKey: text("license_key"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("open"),
  adminReply: text("admin_reply"),
  source: text("source").notNull().default("public"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export type SupportTicket = typeof supportTicketsTable.$inferSelect;
