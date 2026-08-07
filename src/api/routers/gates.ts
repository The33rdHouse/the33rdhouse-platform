import { TRPCError } from "@trpc/server";
import { and, asc, eq, gt } from "drizzle-orm";
import { z } from "zod";
import { canonObjects, gates } from "../../db/schema";
import { decodeNumberCursor, encodeCursor, pageInputSchema } from "../pagination";
import { publicProcedure, router } from "../trpc";

export const gatesRouter = router({
  list: publicProcedure.input(pageInputSchema).query(async ({ ctx, input }) => {
    const cursor = decodeNumberCursor(input.cursor);
    const conditions = [eq(canonObjects.status, "APPROVED")];
    if (cursor !== undefined) conditions.push(gt(gates.ordinal, cursor));
    const rows = await ctx.database
      .select({ id: gates.id, ordinal: gates.ordinal, canonicalName: gates.canonicalName, description: gates.description })
      .from(gates)
      .innerJoin(canonObjects, eq(canonObjects.id, gates.id))
      .where(and(...conditions))
      .orderBy(asc(gates.ordinal))
      .limit(input.limit + 1);
    const hasMore = rows.length > input.limit;
    const items = hasMore ? rows.slice(0, input.limit) : rows;
    return { items, nextCursor: hasMore ? encodeCursor(items.at(-1)!.ordinal) : null };
  }),
  get: publicProcedure.input(z.object({ id: z.string().min(1) })).query(async ({ ctx, input }) => {
    const [item] = await ctx.database
      .select({ id: gates.id, ordinal: gates.ordinal, canonicalName: gates.canonicalName, description: gates.description })
      .from(gates)
      .innerJoin(canonObjects, eq(canonObjects.id, gates.id))
      .where(and(eq(gates.id, input.id), eq(canonObjects.status, "APPROVED")))
      .limit(1);
    if (!item) throw new TRPCError({ code: "NOT_FOUND" });
    return item;
  }),
});
