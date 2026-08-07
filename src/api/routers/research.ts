import { asc, gt } from "drizzle-orm";
import { sources } from "../../db/schema";
import { decodeStringCursor, encodeCursor, pageInputSchema } from "../pagination";
import { publicProcedure, router } from "../trpc";

export const researchRouter = router({
  getSources: publicProcedure.input(pageInputSchema).query(async ({ ctx, input }) => {
    const cursor = decodeStringCursor(input.cursor);
    const rows = await ctx.database
      .select()
      .from(sources)
      .where(cursor ? gt(sources.id, cursor) : undefined)
      .orderBy(asc(sources.id))
      .limit(input.limit + 1);
    const hasMore = rows.length > input.limit;
    const items = hasMore ? rows.slice(0, input.limit) : rows;
    return { items, nextCursor: hasMore ? encodeCursor(items.at(-1)!.id) : null };
  }),
});
