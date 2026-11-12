import { integer, text, timestamp } from "drizzle-orm/pg-core";
import { wikiSchema } from "./articles";

export const opponentUsers = wikiSchema.table("opponent_users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const opponentSessions = wikiSchema.table("opponent_sessions", {
  token: text("token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => opponentUsers.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const opponentRecords = wikiSchema.table("opponent_records", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => opponentUsers.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  totalPower: text("total_power").notNull(),
  outcome: text("outcome").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const opponentStats = wikiSchema.table("opponent_stats", {
  id: text("id").primaryKey(),
  opponentId: text("opponent_id")
    .notNull()
    .references(() => opponentRecords.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  value: text("value").notNull(),
  attention: text("attention").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});
