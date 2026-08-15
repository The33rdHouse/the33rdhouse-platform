import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "../../src/db/client";
import {
  auditLog,
  canonObjects,
  canonSourceRecords,
  canonVersions,
  deities,
  deityAliases,
  traditions,
} from "../../src/db/schema";
import { deterministicKnowledgeId, parseMappingClaim } from "../../src/canon/knowledge";
import { importSources } from "../../src/import/pipeline";
import type { ParsedSourcePackage, StagingRecord } from "../../src/import/types";
import aliasFixture from "../fixtures/duplicate-deity-alias.json";
import traditionFixture from "../fixtures/conflicting-tradition.json";
import claimsFixture from "../fixtures/claims-confidence.json";

const deityId = deterministicKnowledgeId("deity", "Thor", "NOR-THOR-0001");
const deityTraditionId = deterministicKnowledgeId(
  "tradition",
  "Norse/Germanic",
  "Norse/Germanic",
);
const conflictingTraditionId = deterministicKnowledgeId(
  "tradition",
  "Wisdom Lineage",
  "wisdom-lineage",
);
const objectIds = [deityId, deityTraditionId, conflictingTraditionId];

async function cleanup(): Promise<void> {
  await db.delete(deityAliases).where(eq(deityAliases.deityId, deityId));
  await db.delete(deities).where(eq(deities.id, deityId));
  await db.delete(auditLog).where(inArray(auditLog.objectId, objectIds));
  await db.delete(canonVersions).where(inArray(canonVersions.objectId, objectIds));
  await db.delete(canonObjects).where(inArray(canonObjects.id, objectIds));
  await db.delete(traditions).where(inArray(traditions.id, [deityTraditionId, conflictingTraditionId]));
  await db
    .delete(canonSourceRecords)
    .where(
      and(
        eq(canonSourceRecords.packageId, "deity-atlas"),
        inArray(canonSourceRecords.sourceRecordId, ["thor-a", "thor-b"]),
      ),
    );
  await db
    .delete(canonSourceRecords)
    .where(
      and(
        eq(canonSourceRecords.packageId, "escape-matrix"),
        inArray(canonSourceRecords.sourceRecordId, ["wisdom-a", "wisdom-b"]),
      ),
    );
}

beforeEach(cleanup);
afterEach(cleanup);

describe("canonical knowledge import", () => {
  it("deduplicates normalized aliases while preserving separate raw source records", async () => {
    const parsed: ParsedSourcePackage = {
      sourceId: "deity-atlas",
      records: aliasFixture as StagingRecord[],
      media: [],
      warnings: [],
    };

    await importSources(db, [parsed], "knowledge-test");

    const aliases = await db.select().from(deityAliases).where(eq(deityAliases.deityId, deityId));
    expect(aliases).toHaveLength(1);
    expect(aliases[0]?.alias).toBe("Þórr");

    const rawRecords = await db
      .select()
      .from(canonSourceRecords)
      .where(
        and(
          eq(canonSourceRecords.packageId, "deity-atlas"),
          inArray(canonSourceRecords.sourceRecordId, ["thor-a", "thor-b"]),
        ),
      );
    expect(rawRecords).toHaveLength(2);
  });

  it("surfaces a tradition display-name conflict without silently renaming the canonical row", async () => {
    const parsed: ParsedSourcePackage = {
      sourceId: "escape-matrix",
      records: traditionFixture as StagingRecord[],
      media: [],
      warnings: [],
    };

    await importSources(db, [parsed], "knowledge-test");

    const [tradition] = await db
      .select()
      .from(traditions)
      .where(eq(traditions.id, conflictingTraditionId));
    expect(tradition?.canonicalName).toBe("Wisdom Lineage");

    const [canon] = await db
      .select()
      .from(canonObjects)
      .where(eq(canonObjects.id, conflictingTraditionId));
    expect(canon?.status).toBe("UNDER_REVIEW");
  });

  it("validates mapping types and A-D confidence values", () => {
    expect(() => parseMappingClaim(claimsFixture.invalidType)).toThrow();
    expect(() => parseMappingClaim(claimsFixture.invalidConfidence)).toThrow();
    expect(parseMappingClaim(claimsFixture.valid)).toMatchObject({
      type: "ANALOGY",
      confidence: "C",
    });
  });
});
