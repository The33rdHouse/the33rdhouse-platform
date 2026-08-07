import { randomUUID } from "node:crypto";
import { TRPCError } from "@trpc/server";
import { and, asc, eq, gt } from "drizzle-orm";
import { z } from "zod";
import {
  canonObjects,
  MAPPING_CONFIDENCE,
  MAPPING_TYPES,
  mappingClaims,
} from "../../db/schema";
import { promoteCanonObjectInTransaction } from "../../canon/promotion";
import { reviewCanonObjectInTransaction } from "../../canon/governance";
import { decodeStringCursor, encodeCursor, pageInputSchema } from "../pagination";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "../trpc";

const createInput = z.object({
  fromObjectId: z.string().min(1),
  toObjectId: z.string().min(1),
  type: z.enum(MAPPING_TYPES),
  confidence: z.enum(MAPPING_CONFIDENCE),
  rationale: z.string().trim().max(5000).optional(),
});

const reviewInput = z.object({
  id: z.string().min(1),
  decision: z.enum(["APPROVED", "REJECTED", "ARCHIVED"]),
  notes: z.string().trim().max(5000).optional(),
});

function claimPayload(claim: typeof mappingClaims.$inferSelect): Record<string, unknown> {
  return {
    fromObjectId: claim.fromObjectId,
    toObjectId: claim.toObjectId,
    mappingType: claim.mappingType,
    confidence: claim.confidence,
    rationale: claim.rationale,
  };
}

export const claimsRouter = router({
  list: publicProcedure.input(pageInputSchema).query(async ({ ctx, input }) => {
    const cursor = decodeStringCursor(input.cursor);
    const conditions = [eq(mappingClaims.status, "APPROVED")];
    if (cursor) conditions.push(gt(mappingClaims.id, cursor));
    const rows = await ctx.database
      .select()
      .from(mappingClaims)
      .where(and(...conditions))
      .orderBy(asc(mappingClaims.id))
      .limit(input.limit + 1);
    const hasMore = rows.length > input.limit;
    const items = hasMore ? rows.slice(0, input.limit) : rows;
    return { items, nextCursor: hasMore ? encodeCursor(items.at(-1)!.id) : null };
  }),

  create: protectedProcedure.input(createInput).mutation(async ({ ctx, input }) => {
    const id = `claim-${randomUUID()}`;
    return ctx.database.transaction(async (tx) => {
      const [claim] = await tx
        .insert(mappingClaims)
        .values({
          id,
          fromObjectId: input.fromObjectId,
          toObjectId: input.toObjectId,
          mappingType: input.type,
          confidence: input.confidence,
          status: "DRAFT",
          rationale: input.rationale,
        })
        .returning();
      if (!claim) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await promoteCanonObjectInTransaction(
        tx,
        {
          objectId: id,
          objectType: "mapping_claim",
          level: "CONTENT",
          status: "DRAFT",
          payload: claimPayload(claim),
        },
        ctx.userId,
      );
      return claim;
    });
  }),

  review: adminProcedure.input(reviewInput).mutation(async ({ ctx, input }) => {
    return ctx.database.transaction(async (tx) => {
      const [claim] = await tx
        .select()
        .from(mappingClaims)
        .where(eq(mappingClaims.id, input.id))
        .limit(1);
      if (!claim) throw new TRPCError({ code: "NOT_FOUND" });

      const [governance] = await tx
        .select({ id: canonObjects.id })
        .from(canonObjects)
        .where(eq(canonObjects.id, claim.id))
        .limit(1);
      if (!governance) {
        await promoteCanonObjectInTransaction(
          tx,
          {
            objectId: claim.id,
            objectType: "mapping_claim",
            level: "CONTENT",
            status: claim.status,
            payload: claimPayload(claim),
          },
          ctx.userId,
        );
      }

      await reviewCanonObjectInTransaction(
        tx,
        {
          objectId: claim.id,
          decision: input.decision,
          notes: input.notes,
          payload: claimPayload(claim),
        },
        ctx.userId,
      );

      const [updated] = await tx
        .update(mappingClaims)
        .set({ status: input.decision })
        .where(eq(mappingClaims.id, claim.id))
        .returning();
      return updated!;
    });
  }),
});
