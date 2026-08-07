import { desc, lt } from "drizzle-orm";
import { auditLog } from "../../db/schema";
import { decodeNumberCursor, encodeCursor, pageInputSchema } from "../pagination";
import { adminProcedure, router } from "../trpc";

export const adminRouter = router({
  auditLog: adminProcedure.input(pageInputSchema).query(async ({ ctx, input }) => {
    const cursor = decodeNumberCursor(input.cursor);
    const rows = await ctx.database
      .select()
      .from(auditLog)
      .where(cursor !== undefined ? lt(auditLog.id, cursor) : undefined)
      .orderBy(desc(auditLog.id))
      .limit(input.limit + 1);
    const hasMore = rows.length > input.limit;
    const items = hasMore ? rows.slice(0, input.limit) : rows;
    return { items, nextCursor: hasMore ? encodeCursor(items.at(-1)!.id) : null };
  }),
});
