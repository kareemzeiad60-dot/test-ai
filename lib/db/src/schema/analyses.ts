import { pgTable, serial, text, real, integer, jsonb, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./auth";

export const analysesTable = pgTable("analyses", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  imageData: text("image_data"),
  imageName: text("image_name"),
  topBreed: varchar("top_breed").notNull(),
  topConfidence: real("top_confidence").notNull(),
  predictions: jsonb("predictions").notNull().$type<Array<{ breed: string; confidence: number; rank: number }>>(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAnalysisSchema = createInsertSchema(analysesTable).omit({ id: true, createdAt: true });
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type Analysis = typeof analysesTable.$inferSelect;
