import { z } from "zod";
import { getProgress, recordDiscovery } from "../../progression/service";
import { protectedProcedure, router } from "../trpc";

export const progressRouter = router({
  get: protectedProcedure.query(({ ctx }) => getProgress(ctx.userId, ctx.database)),

  recordDiscovery: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1).max(200),
        objectId: z.string().min(1).max(200),
        discoveryType: z.string().min(1).max(100),
        xpAwarded: z.number().int().min(0).max(10000).default(0),
      }),
    )
    .mutation(({ ctx, input }) => recordDiscovery(ctx.userId, input, ctx.database)),
});
