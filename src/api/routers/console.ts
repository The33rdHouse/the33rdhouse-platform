import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { consoleApplications, auditLog, users } from "../../db/schema";
import { intakeSchema, TERMS_VERSION } from "../../console/policy";
import { exhibitList } from "../../console/vault";
export const consoleRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    const [user] = await ctx.database
      .select({ id: users.id, name: users.displayName })
      .from(users)
      .where(eq(users.id, ctx.userId));
    return {
      user,
      roles: [...ctx.roles],
      termsVersion: TERMS_VERSION,
      auditStatus: "UNAVAILABLE" as const,
      signingStatus: "EXTERNAL_VERIFICATION_REQUIRED" as const,
    };
  }),
  registry: protectedProcedure.query(() => exhibitList()),
  applications: protectedProcedure.query(({ ctx }) =>
    ctx.database
      .select()
      .from(consoleApplications)
      .where(eq(consoleApplications.applicantUserId, ctx.userId))
      .limit(1),
  ),
  submitApplication: protectedProcedure
    .input(intakeSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.database.transaction(async (tx) => {
        const [row] = await tx
          .insert(consoleApplications)
          .values({
            applicantUserId: ctx.userId,
            name: input.name,
            email: input.email,
            requestedRole: input.requestedRole,
            termsVersion: input.termsVersion,
          })
          .onConflictDoNothing()
          .returning();
        if (!row)
          throw new TRPCError({
            code: "CONFLICT",
            message: "An application is already recorded for this account.",
          });
        await tx
          .insert(auditLog)
          .values({
            actorUserId: ctx.userId,
            action: "CONSOLE_APPLICATION_SUBMITTED",
            objectId: row.id,
            metadata: {
              termsVersion: input.termsVersion,
              requestedRole: input.requestedRole,
            },
          });
        return row;
      });
    }),
});
