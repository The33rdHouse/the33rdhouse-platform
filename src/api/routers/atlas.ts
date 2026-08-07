import { TRPCError } from "@trpc/server";
import { and, asc, eq, gt, ilike } from "drizzle-orm";
import { z } from "zod";
import { canonObjects, deities, deityAliases } from "../../db/schema";
import { decodeStringCursor, encodeCursor } from "../pagination";
import { publicProcedure, router } from "../trpc";

const searchInput = z.object({
  query: z.string().trim().min(1).max(200).optional(),
  limit: z.number().int().min(1).max(100).default(25),
  cursor: z.string().min(1).optional(),
});

export const atlasRouter = router({
  search: publicProcedure.input(searchInput).query(async ({ ctx, input }) => {
    const cursor = decodeStringCursor(input.cursor);
    const conditions = [eq(canonObjects.status, "APPROVED")];
    if (cursor) conditions.push(gt(deities.id, cursor));
    if (input.query) conditions.push(ilike(deities.canonicalName, `%${input.query}%`));

    const rows = await ctx.database
      .select({
        id: deities.id,
        canonicalName: deities.canonicalName,
        traditionId: deities.traditionId,
        eraId: deities.eraId,
        description: deities.description,
      })
      .from(deities)
      .innerJoin(canonObjects, eq(canonObjects.id, deities.id))
      .where(and(...conditions))
      .orderBy(asc(deities.id))
      .limit(input.limit + 1);

    const hasMore = rows.length > input.limit;
    const items = hasMore ? rows.slice(0, input.limit) : rows;
    return { items, nextCursor: hasMore ? encodeCursor(items.at(-1)!.id) : null };
  }),

  getDeity: publicProcedure.input(z.object({ id: z.string().min(1) })).query(async ({ ctx, input }) => {
    const [item] = await ctx.database
      .select({
        id: deities.id,
        canonicalName: deities.canonicalName,
        traditionId: deities.traditionId,
        eraId: deities.eraId,
        description: deities.description,
      })
      .from(deities)
      .innerJoin(canonObjects, eq(canonObjects.id, deities.id))
      .where(and(eq(deities.id, input.id), eq(canonObjects.status, "APPROVED")))
      .limit(1);
    if (!item) throw new TRPCError({ code: "NOT_FOUND" });
    const aliases = await ctx.database
      .select({ alias: deityAliases.alias })
      .from(deityAliases)
      .where(eq(deityAliases.deityId, item.id))
      .orderBy(asc(deityAliases.alias));
    return { ...item, aliases: aliases.map((entry) => entry.alias) };
  }),
});
