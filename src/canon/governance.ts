import { and, eq } from "drizzle-orm";
import { canonObjects, canonReviews, canonVersions } from "../db/schema";
import {
  promoteCanonObjectInTransaction,
  type CanonStatus,
  type CanonVersion,
  type CanonicalDatabase,
} from "./promotion";

export type ReviewDecision = Extract<CanonStatus, "APPROVED" | "REJECTED" | "ARCHIVED">;

export async function reviewCanonObject(
  database: CanonicalDatabase,
  input: {
    objectId: string;
    decision: ReviewDecision;
    notes?: string;
    payload?: Record<string, unknown>;
  },
  actor: string,
): Promise<CanonVersion> {
  return database.transaction(async (tx) => {
    const [object] = await tx.select().from(canonObjects).where(eq(canonObjects.id, input.objectId));
    if (!object) throw new Error(`Canon object not found: ${input.objectId}`);

    const [currentVersion] = await tx
      .select()
      .from(canonVersions)
      .where(
        and(
          eq(canonVersions.objectId, input.objectId),
          eq(canonVersions.version, object.currentVersion),
        ),
      );
    if (!currentVersion) throw new Error(`Current canon version not found: ${input.objectId}`);

    const payload = input.payload ?? (currentVersion.payload as Record<string, unknown>);
    const promoted = await promoteCanonObjectInTransaction(
      tx,
      {
        objectId: object.id,
        objectType: object.objectType,
        level: object.level,
        status: input.decision,
        payload,
      },
      actor,
    );

    await tx.insert(canonReviews).values({
      objectId: object.id,
      versionId: promoted.id,
      decision: input.decision,
      actorUserId: actor,
      notes: input.notes,
    });

    return promoted;
  });
}
