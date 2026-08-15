import {
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { canonStatusEnum } from "./canon";

export const MAPPING_TYPES = [
  "EQUIVALENCE",
  "ANALOGY",
  "FUNCTIONAL_SIMILARITY",
  "SYMBOLIC_RESONANCE",
] as const;
export const MAPPING_CONFIDENCE = ["A", "B", "C", "D"] as const;

export const mappingTypeEnum = pgEnum("mapping_type", MAPPING_TYPES);
export const mappingConfidenceEnum = pgEnum("mapping_confidence", MAPPING_CONFIDENCE);

export const traditions = pgTable("traditions", {
  id: text("id").primaryKey(),
  canonicalName: text("canonical_name").notNull().unique(),
  description: text("description"),
});

export const eras = pgTable("eras", {
  id: text("id").primaryKey(),
  canonicalName: text("canonical_name").notNull().unique(),
  description: text("description"),
});

export const deities = pgTable("deities", {
  id: text("id").primaryKey(),
  canonicalName: text("canonical_name").notNull(),
  traditionId: text("tradition_id").references(() => traditions.id, { onDelete: "set null" }),
  eraId: text("era_id").references(() => eras.id, { onDelete: "set null" }),
  description: text("description"),
});

export const deityAliases = pgTable(
  "deity_aliases",
  {
    id: serial("id").primaryKey(),
    deityId: text("deity_id")
      .notNull()
      .references(() => deities.id, { onDelete: "cascade" }),
    alias: text("alias").notNull(),
  },
  (table) => [uniqueIndex("deity_aliases_deity_alias_uq").on(table.deityId, table.alias)],
);

export const concepts = pgTable("concepts", {
  id: text("id").primaryKey(),
  canonicalName: text("canonical_name").notNull(),
  traditionId: text("tradition_id").references(() => traditions.id, { onDelete: "set null" }),
  description: text("description"),
});

export const sources = pgTable("sources", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author"),
  locator: text("locator"),
  publicationYear: text("publication_year"),
});

export const citations = pgTable("citations", {
  id: text("id").primaryKey(),
  sourceId: text("source_id")
    .notNull()
    .references(() => sources.id, { onDelete: "cascade" }),
  locator: text("locator"),
  excerpt: text("excerpt"),
});

export const mappingClaims = pgTable("mapping_claims", {
  id: text("id").primaryKey(),
  fromObjectId: text("from_object_id").notNull(),
  toObjectId: text("to_object_id").notNull(),
  mappingType: mappingTypeEnum("mapping_type").notNull(),
  confidence: mappingConfidenceEnum("confidence").notNull(),
  status: canonStatusEnum("status").default("DRAFT").notNull(),
  rationale: text("rationale"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const mappingClaimEvidence = pgTable(
  "mapping_claim_evidence",
  {
    claimId: text("claim_id")
      .notNull()
      .references(() => mappingClaims.id, { onDelete: "cascade" }),
    citationId: text("citation_id")
      .notNull()
      .references(() => citations.id, { onDelete: "cascade" }),
  },
  (table) => [uniqueIndex("mapping_claim_evidence_uq").on(table.claimId, table.citationId)],
);
