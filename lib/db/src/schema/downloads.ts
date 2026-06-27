import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const downloadsTable = pgTable("downloads", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  fileUrl: text("file_url"),
  fileUrl2: text("file_url_2"),
  category: text("category").notNull().default("pack"),
  catalog: text("catalog").notNull().default("vip"),
  tier: text("tier").notNull().default("all"),
  downloadCount: integer("download_count").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const catalogViewsTable = pgTable("catalog_views", {
  catalog: text("catalog").primaryKey(),
  viewCount: integer("view_count").notNull().default(0),
});

export const insertDownloadSchema = createInsertSchema(downloadsTable).omit({ id: true, createdAt: true });
export type InsertDownload = z.infer<typeof insertDownloadSchema>;
export type Download = typeof downloadsTable.$inferSelect;
export type CatalogView = typeof catalogViewsTable.$inferSelect;
