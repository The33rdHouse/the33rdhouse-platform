import { beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "../../src/db/client";
import { auditLog, canonObjects, canonVersions } from "../../src/db/schema";
import { promoteCanonObject } from "../../src/canon/promotion";

const objectId = "realm-test-versioning";

async function cleanup(): Promise<void> {
  await db.delete(auditLog).where(eq(auditLog.objectId, objectId));
  await db.delete(canonVersions).where(eq(canonVersions.objectId, objectId));
  await db.delete(canonObjects).where(eq(canonObjects.id, objectId));
}

beforeEach(cleanup);

describe("promoteCanonObject", () => {
  it("appends canon versions and audit events rather than rewriting history", async () => {
    const first = await promoteCanonObject(
      db,
      {
        objectId,
        objectType: "realm",
        level: "STRUCTURAL",
        status: "APPROVED",
        payload: { name: "First canonical name" },
      },
      "integration-test",
    );
    const second = await promoteCanonObject(
      db,
      {
        objectId,
        objectType: "realm",
        level: "STRUCTURAL",
        status: "APPROVED",
        payload: { name: "Revised canonical name" },
      },
      "integration-test",
    );

    expect(first.version).toBe(1);
    expect(second.version).toBe(2);

    const versions = await db
      .select()
      .from(canonVersions)
      .where(eq(canonVersions.objectId, objectId));
    expect(versions.map((version) => version.version).sort()).toEqual([1, 2]);

    const audits = await db.select().from(auditLog).where(eq(auditLog.objectId, objectId));
    expect(audits).toHaveLength(2);
  });
});
