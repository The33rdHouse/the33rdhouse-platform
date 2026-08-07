import {
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./identity";
import { gates, realms } from "./structure";

export const ranks = pgTable("ranks", {
  id: text("id").primaryKey(),
  ordinal: integer("ordinal").notNull().unique(),
  name: text("name").notNull().unique(),
  unlockRule: text("unlock_rule").notNull(),
});

export const userProgress = pgTable("user_progress", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  xp: integer("xp").default(0).notNull(),
  rankId: text("rank_id").references(() => ranks.id, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const userGateProgress = pgTable(
  "user_gate_progress",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    gateId: text("gate_id")
      .notNull()
      .references(() => gates.id, { onDelete: "cascade" }),
    completedRealms: integer("completed_realms").default(0).notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [primaryKey({ columns: [table.userId, table.gateId] })],
);

export const userRealmProgress = pgTable(
  "user_realm_progress",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    realmId: text("realm_id")
      .notNull()
      .references(() => realms.id, { onDelete: "cascade" }),
    status: text("status").default("NOT_STARTED").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.realmId] })],
);

export const discoveries = pgTable("discoveries", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  objectId: text("object_id").notNull(),
  discoveryType: text("discovery_type").notNull(),
  xpAwarded: integer("xp_awarded").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const achievements = pgTable("achievements", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  unlockRule: text("unlock_rule").notNull(),
});

export const userAchievements = pgTable(
  "user_achievements",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    achievementId: text("achievement_id")
      .notNull()
      .references(() => achievements.id, { onDelete: "cascade" }),
    unlockedAt: timestamp("unlocked_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.achievementId] })],
);

export const userRankHistory = pgTable("user_rank_history", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  rankId: text("rank_id")
    .notNull()
    .references(() => ranks.id, { onDelete: "restrict" }),
  achievedAt: timestamp("achieved_at", { withTimezone: true }).defaultNow().notNull(),
});

export const bookmarks = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  objectId: text("object_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  realmId: text("realm_id").references(() => realms.id, { onDelete: "set null" }),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
