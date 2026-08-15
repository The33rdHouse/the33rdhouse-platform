import { TRPCError } from "@trpc/server";
import { and, asc, eq, gt } from "drizzle-orm";
import { z } from "zod";
import { canonObjects, realms } from "../../db/schema";
import { completeRealm } from "../../progression/service";
import { decodeNumberCursor, encodeCursor, pageInputSchema } from "../pagination";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const realmsRouter = router({
  list: publicProcedure.input(pageInputSchema).query(async ({ ctx, input }) => {
    const cursor = decodeNumberCursor(input.cursor);
    const conditions = [eq(canonObjects.status, "APPROVED")];
    if (cursor !== undefined) conditions.push(gt(realms.realmNumber, cursor));

    const rows = await ctx.database
      .select({
        id: realms.id,
        realmNumber: realms.realmNumber,
        gateId: realms.gateId,
        canonicalName: realms.canonicalName,
        canonicalDescription: realms.canonicalDescription,
      })
      .from(realms)
      .innerJoin(canonObjects, eq(canonObjects.id, realms.id))
      .where(and(...conditions))
      .orderBy(asc(realms.realmNumber))
      .limit(input.limit + 1);

    const hasMore = rows.length > input.limit;
    const items = hasMore ? rows.slice(0, input.limit) : rows;
    return {
      items,
      nextCursor: hasMore ? encodeCursor(items.at(-1)!.realmNumber) : null,
    };
  }),

  get: publicProcedure.input(z.object({ id: z.string().min(1) })).query(async ({ ctx, input }) => {
    const [realm] = await ctx.database
      .select({
        id: realms.id,
        realmNumber: realms.realmNumber,
        gateId: realms.gateId,
        canonicalName: realms.canonicalName,
        canonicalDescription: realms.canonicalDescription,
      })
      .from(realms)
      .innerJoin(canonObjects, eq(canonObjects.id, realms.id))
      .where(and(eq(realms.id, input.id), eq(canonObjects.status, "APPROVED")))
      .limit(1);
    if (!realm) throw new TRPCError({ code: "NOT_FOUND" });
    return realm;
  }),

  complete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(({ ctx, input }) => completeRealm(ctx.userId, input.id, ctx.database)),
});
