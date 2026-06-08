import { pgTable, text, serial, timestamp, integer, boolean, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const licensesTable = pgTable("licenses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull().default("seed"),
  clientId: integer("client_id").notNull(),
  totalSeats: integer("total_seats").notNull().default(0),
  status: text("status").notNull().default("healthy"),
  inactivityThresholdDays: integer("inactivity_threshold_days").default(30),
  autoRelease: boolean("auto_release").notNull().default(false),
  expiresAt: date("expires_at", { mode: "string" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertLicenseSchema = createInsertSchema(licensesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertLicense = z.infer<typeof insertLicenseSchema>;
export type License = typeof licensesTable.$inferSelect;
