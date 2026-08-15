import { and, eq } from "drizzle-orm";
import { db as defaultDb } from "../db/client";
import {
  achievements,
  canonObjects,
  discoveries,
  ranks,
  realms,
  userAchievements,
  userGateProgress,
  userProgress,
  userRankHistory,
  userRealmProgress,
  users,
} from "../db/schema";
import type { CanonicalDatabase, CanonicalTransaction } from "../canon/promotion";
import {
  calculateRank,
  parseUnlockRule,
  ruleSatisfied,
  type ProgressMetrics,
  type RankRuleRow,
} from "./ranks";

export const REALM_COMPLETION_XP = 100;

export type DiscoveryInput = {
  id: string;
  objectId: string;
  discoveryType: string;
  xpAwarded?: number;
};

async function assertUser(tx: CanonicalTransaction, userId: string): Promise<void> {
  const [user] = await tx.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1);
  if (!user) throw new Error(`User not found: ${userId}`);
}

async function progressMetrics(tx: CanonicalTransaction, userId: string): Promise<ProgressMetrics> {
  const realmRows = await tx
    .select({ realmId: userRealmProgress.realmId, status: userRealmProgress.status })
    .from(userRealmProgress)
    .where(eq(userRealmProgress.userId, userId));
  const discoveryRows = await tx
    .select({ objectId: discoveries.objectId, discoveryType: discoveries.discoveryType })
    .from(discoveries)
    .where(eq(discoveries.userId, userId));

  const unique = (type: string) =>
    new Set(discoveryRows.filter((row) => row.discoveryType === type).map((row) => row.objectId)).size;

  return {
    discoveries: discoveryRows.length,
    crossTraditionConnections: unique("cross_tradition_connection"),
    completedPaths: unique("path_completion"),
    traditionsIntegrated: unique("tradition_integration"),
    connections: discoveryRows.filter(
      (row) => row.discoveryType === "connection" || row.discoveryType.endsWith("_connection"),
    ).length,
    masteredGates: unique("gate_mastery"),
    completedRealms: realmRows.filter((row) => row.status === "COMPLETED").length,
  };
}

async function applyRankAndAchievements(
  tx: CanonicalTransaction,
  userId: string,
  xp: number,
): Promise<{ metrics: ProgressMetrics; rank: RankRuleRow }> {
  const metrics = await progressMetrics(tx, userId);
  const rankRows = await tx.select().from(ranks).orderBy(ranks.ordinal);
  const rank = calculateRank(metrics, rankRows);
  const [current] = await tx.select().from(userProgress).where(eq(userProgress.userId, userId)).limit(1);

  await tx
    .insert(userProgress)
    .values({ userId, xp, rankId: rank.id, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: userProgress.userId,
      set: { xp, rankId: rank.id, updatedAt: new Date() },
    });

  if (current?.rankId !== rank.id) {
    await tx.insert(userRankHistory).values({ userId, rankId: rank.id });
  }

  const achievementRows = await tx.select().from(achievements);
  for (const achievement of achievementRows) {
    if (!ruleSatisfied(metrics, parseUnlockRule(achievement.unlockRule))) continue;
    await tx
      .insert(userAchievements)
      .values({ userId, achievementId: achievement.id })
      .onConflictDoNothing();
  }

  return { metrics, rank };
}

export async function getProgress(
  userId: string,
  database: CanonicalDatabase = defaultDb,
): Promise<{ xp: number; rank: RankRuleRow; metrics: ProgressMetrics }> {
  return database.transaction(async (tx) => {
    await assertUser(tx, userId);
    const [aggregate] = await tx.select().from(userProgress).where(eq(userProgress.userId, userId)).limit(1);
    const xp = aggregate?.xp ?? 0;
    const { metrics, rank } = await applyRankAndAchievements(tx, userId, xp);
    return { xp, rank, metrics };
  });
}

export async function completeRealm(
  userId: string,
  realmId: string,
  database: CanonicalDatabase = defaultDb,
): Promise<typeof userRealmProgress.$inferSelect> {
  return database.transaction(async (tx) => {
    await assertUser(tx, userId);
    const [realm] = await tx
      .select({ id: realms.id, gateId: realms.gateId })
      .from(realms)
      .innerJoin(canonObjects, eq(canonObjects.id, realms.id))
      .where(and(eq(realms.id, realmId), eq(canonObjects.status, "APPROVED")))
      .limit(1);
    if (!realm) throw new Error(`Approved Realm not found: ${realmId}`);

    const [existing] = await tx
      .select()
      .from(userRealmProgress)
      .where(and(eq(userRealmProgress.userId, userId), eq(userRealmProgress.realmId, realmId)))
      .limit(1);
    if (existing?.status === "COMPLETED") return existing;

    const now = new Date();
    const [completed] = await tx
      .insert(userRealmProgress)
      .values({ userId, realmId, status: "COMPLETED", completedAt: now, updatedAt: now })
      .onConflictDoUpdate({
        target: [userRealmProgress.userId, userRealmProgress.realmId],
        set: { status: "COMPLETED", completedAt: now, updatedAt: now },
      })
      .returning();
    if (!completed) throw new Error(`Failed to complete Realm: ${realmId}`);

    const completedInGate = await tx
      .select({ realmId: userRealmProgress.realmId })
      .from(userRealmProgress)
      .innerJoin(realms, eq(realms.id, userRealmProgress.realmId))
      .where(
        and(
          eq(userRealmProgress.userId, userId),
          eq(userRealmProgress.status, "COMPLETED"),
          eq(realms.gateId, realm.gateId),
        ),
      );
    await tx
      .insert(userGateProgress)
      .values({
        userId,
        gateId: realm.gateId,
        completedRealms: completedInGate.length,
        completedAt: completedInGate.length >= 12 ? now : null,
      })
      .onConflictDoUpdate({
        target: [userGateProgress.userId, userGateProgress.gateId],
        set: {
          completedRealms: completedInGate.length,
          completedAt: completedInGate.length >= 12 ? now : null,
        },
      });

    const [aggregate] = await tx.select().from(userProgress).where(eq(userProgress.userId, userId)).limit(1);
    await applyRankAndAchievements(tx, userId, (aggregate?.xp ?? 0) + REALM_COMPLETION_XP);
    return completed;
  });
}

export async function recordDiscovery(
  userId: string,
  input: DiscoveryInput,
  database: CanonicalDatabase = defaultDb,
): Promise<typeof discoveries.$inferSelect> {
  if (!input.id.trim()) throw new Error("Discovery id must not be empty");
  if (!input.discoveryType.trim()) throw new Error("Discovery type must not be empty");
  const xpAwarded = input.xpAwarded ?? 0;
  if (!Number.isInteger(xpAwarded) || xpAwarded < 0 || xpAwarded > 10000) {
    throw new Error("Discovery XP must be an integer between 0 and 10000");
  }

  return database.transaction(async (tx) => {
    await assertUser(tx, userId);
    const [canonical] = await tx
      .select({ id: canonObjects.id })
      .from(canonObjects)
      .where(and(eq(canonObjects.id, input.objectId), eq(canonObjects.status, "APPROVED")))
      .limit(1);
    if (!canonical) throw new Error(`Approved canonical object not found: ${input.objectId}`);

    const [existing] = await tx
      .select()
      .from(discoveries)
      .where(eq(discoveries.externalId, input.id))
      .limit(1);
    if (existing) {
      if (
        existing.userId !== userId ||
        existing.objectId !== input.objectId ||
        existing.discoveryType !== input.discoveryType ||
        existing.xpAwarded !== xpAwarded
      ) {
        throw new Error(`Discovery id ${input.id} is already bound to different data`);
      }
      return existing;
    }

    const [created] = await tx
      .insert(discoveries)
      .values({
        externalId: input.id,
        userId,
        objectId: input.objectId,
        discoveryType: input.discoveryType,
        xpAwarded,
      })
      .returning();
    if (!created) throw new Error(`Failed to record discovery: ${input.id}`);

    const [aggregate] = await tx.select().from(userProgress).where(eq(userProgress.userId, userId)).limit(1);
    await applyRankAndAchievements(tx, userId, (aggregate?.xp ?? 0) + xpAwarded);
    return created;
  });
}
