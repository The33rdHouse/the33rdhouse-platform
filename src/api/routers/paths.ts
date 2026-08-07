import { and, asc, eq, gt } from "drizzle-orm";
import { canonObjects, paths } from "../../db/schema";
import { decodeNumberCursor, encodeCursor, pageInputSchema } from "../pagination";
import { publicProcedure, router } from "../trpc";

export const pathsRouter = router({
  list: publicProcedure.input(pageInputSchema).query(async ({ ctx, input }) => {
    const cursor = decodeNumberCursor(input.cursor);
    const conditions = [eq(canonObjects.status, "APPROVED")];
    if (cursor !== undefined) conditions.push(gt(paths.ordinal, cursor));
    const rows = await ctx.database
      .select({ id: paths.id, ordinal: paths.ordinal, canonicalName: paths.canonicalName, description: paths.description })
      .from(paths)
      .innerJoin(canonObjects, eq(canonObjects.id, paths.id))
      .where(and(...conditions))
      .orderBy(asc(paths.ordinal))
      .limit(input.limit + 1);
    const hasMore = rows.length > input.limit;
    const items = hasMore ? rows.slice(0, input.limit) : rows;
    return { items, nextCursor: hasMore ? encodeCursor(items.at(-1)!.ordinal) : null };
  }),
});
