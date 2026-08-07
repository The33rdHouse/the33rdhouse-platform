import { TRPCError } from "@trpc/server";
import { and, asc, eq, gt } from "drizzle-orm";
import { z } from "zod";
import { canonObjects, traditions } from "../../db/schema";
import { decodeStringCursor, encodeCursor, pageInputSchema } from "../pagination";
import { publicProcedure, router } from "../trpc";

export const traditionsRouter = router({
  list: publicProcedure.input(pageInputSchema).query(async ({ ctx, input }) => {
    const cursor = decodeStringCursor(input.cursor);
    const conditions = [eq(canonObjects.status, "APPROVED")];
    if (cursor) conditions.push(gt(traditions.id, cursor));
    const rows = await ctx.database
      .select({ id: traditions.id, canonicalName: traditions.canonicalName, description: traditions.description })
      .from(traditions)
      .innerJoin(canonObjects, eq(canonObjects.id, traditions.id))
      .where(and(...conditions))
      .orderBy(asc(traditions.id))
      .limit(input.limit + 1);
    const hasMore = rows.length > input.limit;
    const items = hasMore ? rows.slice(0, input.limit) : rows;
    return { items, nextCursor: hasMore ? encodeCursor(items.at(-1)!.id) : null };
  }),
  get: publicProcedure.input(z.object({ id: z.string().min(1) })).query(async ({ ctx, input }) => {
    const [item] = await ctx.database
      .select({ id: traditions.id, canonicalName: traditions.canonicalName, description: traditions.description })
      .from(traditions)
      .innerJoin(canonObjects, eq(canonObjects.id, traditions.id))
      .where(and(eq(traditions.id, input.id), eq(canonObjects.status, "APPROVED")))
      .limit(1);
    if (!item) throw new TRPCError({ code: "NOT_FOUND" });
    return item;
  }),
});
