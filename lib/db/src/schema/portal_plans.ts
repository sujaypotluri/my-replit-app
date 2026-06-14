import { pgTable, text, serial, timestamp, boolean, integer, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const portalPricingPlansTable = pgTable("portal_pricing_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  tagline: text("tagline"),
  monthlyPrice: numeric("monthly_price", { precision: 10, scale: 2 }).notNull(),
  annualPrice: numeric("annual_price", { precision: 10, scale: 2 }).notNull(),
  seatsIncluded: integer("seats_included").notNull(),
  maxSeats: integer("max_seats"),
  features: jsonb("features").$type<string[]>().notNull().default([]),
  highlighted: boolean("highlighted").notNull().default(false),
  badge: text("badge"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPortalPricingPlanSchema = createInsertSchema(portalPricingPlansTable).omit({ id: true, createdAt: true });
export type InsertPortalPricingPlan = z.infer<typeof insertPortalPricingPlanSchema>;
export type PortalPricingPlan = typeof portalPricingPlansTable.$inferSelect;
