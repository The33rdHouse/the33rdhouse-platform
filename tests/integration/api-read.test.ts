import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { eq, inArray } from "drizzle-orm";
import { db } from "../../src/db/client";
import { canonObjects, gates, realms } from "../../src/db/schema";
import { createContext } from "../../src/api/context";
import { appRouter } from "../../src/api/router";

const gateObjectId = "gate-12";
const realmIds = ["realm-143", "realm-144"];

async function cleanup(): Promise<void> {
  await db.delete(canonObjects).where(inArray(canonObjects.id, realmIds));
  await db.delete(realms).where(inArray(realms.id, realmIds));
  await db.delete(gates).where(eq(gates.id, gateObjectId));
}

beforeEach(cleanup);
afterEach(cleanup);

describe("public canonical API", () => {
  it("returns only APPROVED Realms to a public caller", async () => {
    await db.insert(gates).values({ id: gateObjectId, ordinal: 12, canonicalName: "Gate Twelve" });
    await db.insert(realms).values([
      {
        id: "realm-143",
        realmNumber: 143,
        gateId: gateObjectId,
        canonicalName: "Approved Realm",
      },
      {
        id: "realm-144",
        realmNumber: 144,
        gateId: gateObjectId,
        canonicalName: "Review Realm",
      },
    ]);
    await db.insert(canonObjects).values([
      {
        id: "realm-143",
        objectType: "realm",
        level: "STRUCTURAL",
        status: "APPROVED",
        currentVersion: 0,
      },
      {
        id: "realm-144",
        objectType: "realm",
        level: "STRUCTURAL",
        status: "UNDER_REVIEW",
        currentVersion: 0,
      },
    ]);

    const caller = appRouter.createCaller(await createContext({ database: db, userId: null }));
    const result = await caller.realms.list({ limit: 100 });

    expect(result.items.map((item) => item.id)).toEqual(["realm-143"]);
  });
});
