import { asc, eq, gt } from "drizzle-orm";
import { achievements, userAchievements } from "../../db/schema";
import { decodeStringCursor, encodeCursor, pageInputSchema } from "../pagination";
import { protectedProcedure, router } from "../trpc";

export const achievementsRouter = router({
  list: protectedProcedure.input(pageInputSchema).query(async ({ ctx, input }) => {
    const cursor = decodeStringCursor(input.cursor);
    const rows = await ctx.database
      .select()
      .from(achievements)
      .where(cursor ? gt(achievements.id, cursor) : undefined)
      .orderBy(asc(achievements.id))
      .limit(input.limit + 1);
    const unlocked = await ctx.database
      .select({ achievementId: userAchievements.achievementId, unlockedAt: userAchievements.unlockedAt })
      .from(userAchievements)
      .where(eq(userAchievements.userId, ctx.userId));
    const unlockedById = new Map(unlocked.map((item) => [item.achievementId, item.unlockedAt]));
    const hasMore = rows.length > input.limit;
    const page = hasMore ? rows.slice(0, input.limit) : rows;
    const items = page.map((item) => ({
      ...item,
      unlocked: unlockedById.has(item.id),
      unlockedAt: unlockedById.get(item.id) ?? null,
    }));
    return { items, nextCursor: hasMore ? encodeCursor(page.at(-1)!.id) : null };
  }),
});
