import {
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { canonSourceRecords } from "./canon";

export const gates = pgTable("gates", {
  id: text("id").primaryKey(),
  ordinal: integer("ordinal").notNull().unique(),
  canonicalName: text("canonical_name").notNull(),
  description: text("description"),
});

export const paths = pgTable("paths", {
  id: text("id").primaryKey(),
  ordinal: integer("ordinal").notNull().unique(),
  canonicalName: text("canonical_name").notNull(),
  description: text("description"),
});

export const realms = pgTable("realms", {
  id: text("id").primaryKey(),
  realmNumber: integer("realm_number").notNull().unique(),
  gateId: text("gate_id")
    .notNull()
    .references(() => gates.id, { onDelete: "restrict" }),
  canonicalName: text("canonical_name"),
  canonicalDescription: text("canonical_description"),
});

export const realmSourceVariants = pgTable(
  "realm_source_variants",
  {
    id: serial("id").primaryKey(),
    realmId: text("realm_id")
      .notNull()
      .references(() => realms.id, { onDelete: "cascade" }),
    sourceRecordId: text("source_record_id")
      .notNull()
      .references(() => canonSourceRecords.id, { onDelete: "restrict" }),
    rawName: text("raw_name"),
    rawDescription: text("raw_description"),
    rawGateOrdinal: integer("raw_gate_ordinal"),
    rawMetadata: jsonb("raw_metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("realm_source_variants_source_record_uq").on(table.sourceRecordId)],
);

export const practices = pgTable("practices", {
  id: text("id").primaryKey(),
  realmId: text("realm_id").references(() => realms.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  body: text("body"),
});

export const glyphs = pgTable("glyphs", {
  id: text("id").primaryKey(),
  realmId: text("realm_id").references(() => realms.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  assetKey: text("asset_key"),
});

export const correspondences = pgTable("correspondences", {
  id: text("id").primaryKey(),
  fromObjectId: text("from_object_id").notNull(),
  toObjectId: text("to_object_id").notNull(),
  relationType: text("relation_type").notNull(),
  metadata: jsonb("metadata"),
});
