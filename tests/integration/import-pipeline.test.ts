import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { and, eq } from "drizzle-orm";
import { db, pool } from "../../src/db/client";
import {
  auditLog,
  canonObjects,
  canonSourceRecords,
  canonVersions,
  gates,
  realmSourceVariants,
  realms,
} from "../../src/db/schema";
import { importSources } from "../../src/import/pipeline";
import type { ParsedSourcePackage } from "../../src/import/types";

const sourceId = "deity-atlas" as const;
const realmObjectId = "realm-027";
const gateObjectId = "gate-03";

async function cleanup(): Promise<void> {
  await db.delete(auditLog).where(eq(auditLog.objectId, realmObjectId));
  await db.delete(canonVersions).where(eq(canonVersions.objectId, realmObjectId));
  await db.delete(realmSourceVariants).where(eq(realmSourceVariants.realmId, realmObjectId));
  await db
    .delete(canonSourceRecords)
    .where(and(eq(canonSourceRecords.packageId, sourceId), eq(canonSourceRecords.sourceRecordId, "27-a")));
  await db
    .delete(canonSourceRecords)
    .where(and(eq(canonSourceRecords.packageId, sourceId), eq(canonSourceRecords.sourceRecordId, "27-b")));
  await db.delete(canonObjects).where(eq(canonObjects.id, realmObjectId));
  await db.delete(realms).where(eq(realms.id, realmObjectId));
  await db.delete(gates).where(eq(gates.id, gateObjectId));
}

beforeEach(cleanup);
afterAll(async () => {
  await cleanup();
  await pool.end();
});

describe("importSources", () => {
  it("preserves conflicting source variants and governs the Realm as UNDER_REVIEW", async () => {
    const parsed: ParsedSourcePackage = {
      sourceId,
      media: [],
      warnings: [],
      records: [
        {
          kind: "realm_variant",
          sourcePath: "realms_data.json",
          sourceRecordId: "27-a",
          payload: { number: 27, gate: 3, gateName: "Gate Three", name: "Name A", essence: "A" },
        },
        {
          kind: "meditation_realm_variant",
          sourcePath: "meditation_data.json",
          sourceRecordId: "27-b",
          payload: { realm: 27, gate: 3, gateName: "Gate Three", name: "Name B" },
        },
      ],
    };

    const report = await importSources(db, [parsed], "integration-test");
    expect(report.conflicts).toBe(1);

    const variants = await db
      .select()
      .from(realmSourceVariants)
      .where(eq(realmSourceVariants.realmId, realmObjectId));
    expect(variants).toHaveLength(2);

    const [canon] = await db
      .select()
      .from(canonObjects)
      .where(eq(canonObjects.id, realmObjectId));
    expect(canon?.status).toBe("UNDER_REVIEW");
    expect(canon?.currentVersion).toBe(1);
  });
});
