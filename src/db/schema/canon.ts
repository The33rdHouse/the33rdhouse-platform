import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const CANON_LEVELS = ["FOUNDATIONAL", "STRUCTURAL", "CONTENT", "OPERATIONAL"] as const;
export const CANON_STATUSES = ["DRAFT", "UNDER_REVIEW", "APPROVED", "REJECTED", "ARCHIVED"] as const;

export const canonLevelEnum = pgEnum("canon_level", CANON_LEVELS);
export const canonStatusEnum = pgEnum("canon_status", CANON_STATUSES);

export const canonObjects = pgTable("canon_objects", {
  id: text("id").primaryKey(),
  objectType: text("object_type").notNull(),
  level: canonLevelEnum("level").notNull(),
  status: canonStatusEnum("status").default("DRAFT").notNull(),
  currentVersion: integer("current_version").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const canonVersions = pgTable(
  "canon_versions",
  {
    id: serial("id").primaryKey(),
    objectId: text("object_id")
      .notNull()
      .references(() => canonObjects.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    status: canonStatusEnum("status").default("DRAFT").notNull(),
    payload: jsonb("payload").notNull(),
    actorUserId: text("actor_user_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("canon_versions_object_version_uq").on(table.objectId, table.version)],
);

export const canonSourceRecords = pgTable(
  "canon_source_records",
  {
    id: text("id").primaryKey(),
    packageId: text("package_id").notNull(),
    sourcePath: text("source_path").notNull(),
    sourceRecordId: text("source_record_id").notNull(),
    sha256: text("sha256").notNull(),
    rawJson: jsonb("raw_json").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("canon_source_records_origin_uq").on(
      table.packageId,
      table.sourcePath,
      table.sourceRecordId,
    ),
  ],
);

export const canonPins = pgTable("canon_pins", {
  id: serial("id").primaryKey(),
  objectId: text("object_id")
    .notNull()
    .references(() => canonObjects.id, { onDelete: "cascade" }),
  versionId: integer("version_id")
    .notNull()
    .references(() => canonVersions.id, { onDelete: "cascade" }),
  reason: text("reason").notNull(),
  actorUserId: text("actor_user_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const canonReviews = pgTable("canon_reviews", {
  id: serial("id").primaryKey(),
  objectId: text("object_id")
    .notNull()
    .references(() => canonObjects.id, { onDelete: "cascade" }),
  versionId: integer("version_id")
    .notNull()
    .references(() => canonVersions.id, { onDelete: "cascade" }),
  decision: canonStatusEnum("decision").notNull(),
  actorUserId: text("actor_user_id").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  actorUserId: text("actor_user_id").notNull(),
  action: text("action").notNull(),
  objectId: text("object_id"),
  version: integer("version"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
