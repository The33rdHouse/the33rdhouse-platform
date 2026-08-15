import { and, asc, eq, gt, ilike, or } from "drizzle-orm";
import { z } from "zod";
import { correspondences } from "../../db/schema";
import { decodeStringCursor, encodeCursor } from "../pagination";
import { publicProcedure, router } from "../trpc";

const inputSchema = z.object({
  query: z.string().trim().min(1).max(200).optional(),
  relationType: z.string().trim().min(1).max(100).optional(),
  limit: z.number().int().min(1).max(100).default(25),
  cursor: z.string().min(1).optional(),
});

export const correspondencesRouter = router({
  search: publicProcedure.input(inputSchema).query(async ({ ctx, input }) => {
    const cursor = decodeStringCursor(input.cursor);
    const conditions = [];
    if (cursor) conditions.push(gt(correspondences.id, cursor));
    if (input.relationType) conditions.push(eq(correspondences.relationType, input.relationType));
    if (input.query) {
      conditions.push(
        or(
          ilike(correspondences.fromObjectId, `%${input.query}%`),
          ilike(correspondences.toObjectId, `%${input.query}%`),
          ilike(correspondences.relationType, `%${input.query}%`),
        )!,
      );
    }

    const rows = await ctx.database
      .select()
      .from(correspondences)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(asc(correspondences.id))
      .limit(input.limit + 1);
    const hasMore = rows.length > input.limit;
    const items = hasMore ? rows.slice(0, input.limit) : rows;
    return { items, nextCursor: hasMore ? encodeCursor(items.at(-1)!.id) : null };
  }),
});
