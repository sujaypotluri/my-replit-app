import { pgTable, text, serial, timestamp, integer, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const portalOrdersTable = pgTable("portal_orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  status: text("status").notNull().default("confirmed"),
  items: jsonb("items").$type<Array<{
    productId: number;
    productName: string;
    tierId: number;
    tierName: string;
    seats: number;
    unitPrice: number;
    billingCycle: string;
    total: number;
  }>>().notNull().default([]),
  billingCompanyName: text("billing_company_name").notNull(),
  billingContactName: text("billing_contact_name").notNull(),
  billingEmail: text("billing_email").notNull(),
  billingPhone: text("billing_phone"),
  billingAddress: text("billing_address"),
  billingCity: text("billing_city"),
  billingCountry: text("billing_country"),
  billingVatNumber: text("billing_vat_number"),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  discount: numeric("discount", { precision: 10, scale: 2 }),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  estimatedDelivery: text("estimated_delivery"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPortalOrderSchema = createInsertSchema(portalOrdersTable).omit({ id: true, createdAt: true });
export type InsertPortalOrder = z.infer<typeof insertPortalOrderSchema>;
export type PortalOrder = typeof portalOrdersTable.$inferSelect;
