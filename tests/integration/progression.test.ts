import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "../../src/db/client";
import {
  canonObjects,
  discoveries,
  gates,
  ranks,
  realms,
  userGateProgress,
  userProgress,
  userRankHistory,
  userRealmProgress,
  users,
} from "../../src/db/schema";
import { completeRealm, recordDiscovery } from "../../src/progression/service";

const userId = "progression-test-user";
const gateId = "gate-01";
const realmId = "realm-001";
const rankId = "rank-01";

async function cleanup(): Promise<void> {
  await db.delete(userRankHistory).where(eq(userRankHistory.userId, userId));
  await db.delete(discoveries).where(eq(discoveries.userId, userId));
  await db.delete(userRealmProgress).where(eq(userRealmProgress.userId, userId));
  await db.delete(userGateProgress).where(eq(userGateProgress.userId, userId));
  await db.delete(userProgress).where(eq(userProgress.userId, userId));
  await db.delete(users).where(eq(users.id, userId));
  await db.delete(canonObjects).where(eq(canonObjects.id, realmId));
  await db.delete(realms).where(eq(realms.id, realmId));
  await db.delete(gates).where(eq(gates.id, gateId));
  await db.delete(ranks).where(eq(ranks.id, rankId));
}

beforeEach(async () => {
  await cleanup();
  await db.insert(users).values({ id: userId, email: "progression@example.test" });
  await db.insert(gates).values({ id: gateId, ordinal: 1, canonicalName: "Gate One" });
  await db.insert(realms).values({
    id: realmId,
    realmNumber: 1,
    gateId,
    canonicalName: "Foundation Realm",
  });
  await db.insert(canonObjects).values({
    id: realmId,
    objectType: "realm",
    level: "STRUCTURAL",
    status: "APPROVED",
    currentVersion: 0,
  });
  await db.insert(ranks).values({
    id: rankId,
    ordinal: 1,
    name: "Seeker",
    unlockRule: '{"all":[]}',
  });
});

afterEach(cleanup);

describe("progression service", () => {
  it("makes Realm completion idempotent and awards completion XP once", async () => {
    const first = await completeRealm(userId, realmId, db);
    const second = await completeRealm(userId, realmId, db);

    expect(first.status).toBe("COMPLETED");
    expect(second.status).toBe("COMPLETED");

    const progressRows = await db
      .select()
      .from(userRealmProgress)
      .where(eq(userRealmProgress.userId, userId));
    expect(progressRows).toHaveLength(1);

    const [aggregate] = await db.select().from(userProgress).where(eq(userProgress.userId, userId));
    expect(aggregate?.xp).toBe(100);
  });

  it("records a canonical discovery idempotently by external discovery ID", async () => {
    const first = await recordDiscovery(
      userId,
      { id: "discovery-001", objectId: realmId, discoveryType: "realm_insight", xpAwarded: 25 },
      db,
    );
    const second = await recordDiscovery(
      userId,
      { id: "discovery-001", objectId: realmId, discoveryType: "realm_insight", xpAwarded: 25 },
      db,
    );

    expect(second.id).toBe(first.id);
    const rows = await db.select().from(discoveries).where(eq(discoveries.userId, userId));
    expect(rows).toHaveLength(1);

    const [aggregate] = await db.select().from(userProgress).where(eq(userProgress.userId, userId));
    expect(aggregate?.xp).toBe(25);
  });
});
