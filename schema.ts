import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const gtmBriefs = mysqlTable("gtm_briefs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productName: varchar("productName", { length: 255 }).notNull(),
  productDescription: text("productDescription").notNull(),
  industry: varchar("industry", { length: 128 }),
  stage: varchar("stage", { length: 64 }),
  // Structured JSON output fields
  icpData: text("icpData"), // JSON: { profile, painPoints, motivations, demographics }
  positioningStatement: text("positioningStatement"),
  valuePropositions: text("valuePropositions"), // JSON: [{ title, description }]
  channelMessaging: text("channelMessaging"), // JSON: { email, linkedin, landingPage, onboarding }
  competitiveDiff: text("competitiveDiff"), // JSON: [{ differentiator, description }]
  // Export & share
  pdfUrl: text("pdfUrl"),
  shareToken: varchar("shareToken", { length: 64 }).unique(),
  isShared: boolean("isShared").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GtmBrief = typeof gtmBriefs.$inferSelect;
export type InsertGtmBrief = typeof gtmBriefs.$inferInsert;
