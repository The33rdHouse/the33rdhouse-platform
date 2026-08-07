import {
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { canonStatusEnum } from "./canon";
import { realms } from "./structure";

export const MEDIA_AVAILABILITY = ["AVAILABLE", "PLANNED", "MISSING", "ARCHIVED"] as const;
export const mediaAvailabilityEnum = pgEnum("media_availability", MEDIA_AVAILABILITY);

export const teachings = pgTable("teachings", {
  id: text("id").primaryKey(),
  realmId: text("realm_id").references(() => realms.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  body: text("body"),
  weekNumber: integer("week_number"),
});

export const meditations = pgTable("meditations", {
  id: text("id").primaryKey(),
  realmId: text("realm_id").references(() => realms.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  script: text("script"),
  durationSeconds: integer("duration_seconds"),
});

export const mediaAssets = pgTable("media_assets", {
  id: text("id").primaryKey(),
  assetType: text("asset_type").notNull(),
  storageProvider: text("storage_provider").notNull(),
  storageKey: text("storage_key").notNull(),
  mimeType: text("mime_type"),
  durationSeconds: integer("duration_seconds"),
  sha256: text("sha256"),
  version: integer("version").default(1).notNull(),
  publicationStatus: canonStatusEnum("publication_status").default("DRAFT").notNull(),
  availability: mediaAvailabilityEnum("availability").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const realmMedia = pgTable(
  "realm_media",
  {
    realmId: text("realm_id")
      .notNull()
      .references(() => realms.id, { onDelete: "cascade" }),
    mediaAssetId: text("media_asset_id")
      .notNull()
      .references(() => mediaAssets.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.realmId, table.mediaAssetId] })],
);

export const contentReleases = pgTable("content_releases", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  status: canonStatusEnum("status").default("DRAFT").notNull(),
  releasedAt: timestamp("released_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
