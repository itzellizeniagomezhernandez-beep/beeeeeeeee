import { pgTable, serial, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";

export const discountCodesTable = pgTable("discount_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  description: text("description"),
  durationGift: text("duration_gift").notNull().default("7days"),
  maxUses: integer("max_uses").notNull().default(1),
  usedCount: integer("used_count").notNull().default(0),
  active: boolean("active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type DiscountCode = typeof discountCodesTable.$inferSelect;
