import { pgTable, text, serial, timestamp, boolean, integer, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const portalProductsTable = pgTable("portal_products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  category: text("category").notNull().default("platform"),
  shortDescription: text("short_description").notNull(),
  description: text("description").notNull(),
  highlights: jsonb("highlights").$type<string[]>().notNull().default([]),
  popular: boolean("popular").notNull().default(false),
  badge: text("badge"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPortalProductSchema = createInsertSchema(portalProductsTable).omit({ id: true, createdAt: true });
export type InsertPortalProduct = z.infer<typeof insertPortalProductSchema>;
export type PortalProduct = typeof portalProductsTable.$inferSelect;

export const portalLicenseTiersTable = pgTable("portal_license_tiers", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => portalProductsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  pricePerSeat: numeric("price_per_seat", { precision: 10, scale: 2 }).notNull(),
  minSeats: integer("min_seats").notNull().default(1),
  maxSeats: integer("max_seats"),
  billingCycle: text("billing_cycle").notNull().default("monthly"),
  features: jsonb("features").$type<string[]>().notNull().default([]),
  recommended: boolean("recommended").notNull().default(false),
  discount: numeric("discount", { precision: 5, scale: 2 }),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertPortalLicenseTierSchema = createInsertSchema(portalLicenseTiersTable).omit({ id: true });
export type InsertPortalLicenseTier = z.infer<typeof insertPortalLicenseTierSchema>;
export type PortalLicenseTier = typeof portalLicenseTiersTable.$inferSelect;
