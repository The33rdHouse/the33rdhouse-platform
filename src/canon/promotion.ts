import { eq } from "drizzle-orm";
import { db as canonicalDb } from "../db/client";
import {
  auditLog,
  CANON_LEVELS,
  CANON_STATUSES,
  canonObjects,
  canonVersions,
} from "../db/schema";

export type CanonLevel = (typeof CANON_LEVELS)[number];
export type CanonStatus = (typeof CANON_STATUSES)[number];
export type CanonicalDatabase = typeof canonicalDb;
export type CanonicalTransaction = Parameters<Parameters<CanonicalDatabase["transaction"]>[0]>[0];

export type CanonPromotionInput = {
  objectId: string;
  objectType: string;
  level: CanonLevel;
  status: CanonStatus;
  payload: Record<string, unknown>;
};

export type CanonVersion = {
  id: number;
  objectId: string;
  version: number;
  status: CanonStatus;
  payload: unknown;
};

export async function promoteCanonObjectInTransaction(
  tx: CanonicalTransaction,
  input: CanonPromotionInput,
  actor: string,
): Promise<CanonVersion> {
  if (!actor.trim()) throw new Error("Canon actor must not be empty");
  if (!input.objectId.trim()) throw new Error("Canon objectId must not be empty");
  if (!input.objectType.trim()) throw new Error("Canon objectType must not be empty");

  const [existing] = await tx.select().from(canonObjects).where(eq(canonObjects.id, input.objectId));
  const nextVersion = (existing?.currentVersion ?? 0) + 1;

  if (!existing) {
    await tx.insert(canonObjects).values({
      id: input.objectId,
      objectType: input.objectType,
      level: input.level,
      status: "DRAFT",
      currentVersion: 0,
    });
  } else if (existing.objectType !== input.objectType || existing.level !== input.level) {
    throw new Error(`Canon identity mismatch for ${input.objectId}`);
  }

  const [version] = await tx
    .insert(canonVersions)
    .values({
      objectId: input.objectId,
      version: nextVersion,
      status: input.status,
      payload: input.payload,
      actorUserId: actor,
    })
    .returning();

  if (!version) throw new Error(`Failed to create canon version for ${input.objectId}`);

  await tx
    .update(canonObjects)
    .set({
      status: input.status,
      currentVersion: nextVersion,
      updatedAt: new Date(),
    })
    .where(eq(canonObjects.id, input.objectId));

  await tx.insert(auditLog).values({
    actorUserId: actor,
    action: existing ? "CANON_REVISED" : "CANON_CREATED",
    objectId: input.objectId,
    version: nextVersion,
    metadata: {
      objectType: input.objectType,
      level: input.level,
      status: input.status,
    },
  });

  return {
    id: version.id,
    objectId: version.objectId,
    version: version.version,
    status: version.status,
    payload: version.payload,
  };
}

export async function promoteCanonObject(
  database: CanonicalDatabase,
  input: CanonPromotionInput,
  actor: string,
): Promise<CanonVersion> {
  return database.transaction((tx) => promoteCanonObjectInTransaction(tx, input, actor));
}
