import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "../../src/db/client";
import { roles, userRoles, users } from "../../src/db/schema";
import { createContext } from "../../src/api/context";
import { appRouter } from "../../src/api/router";

const userId = "api-nonadmin-user";
const roleId = "api-member-role";

async function cleanup(): Promise<void> {
  await db.delete(userRoles).where(eq(userRoles.userId, userId));
  await db.delete(users).where(eq(users.id, userId));
  await db.delete(roles).where(eq(roles.id, roleId));
}

beforeEach(cleanup);
afterEach(cleanup);

describe("persisted API authorization", () => {
  it("forbids a non-admin from claim review and audit-log procedures", async () => {
    await db.insert(users).values({ id: userId, email: "api-nonadmin@example.test" });
    await db.insert(roles).values({ id: roleId, name: "member" });
    await db.insert(userRoles).values({ userId, roleId });

    const caller = appRouter.createCaller(await createContext({ database: db, userId }));

    await expect(
      caller.claims.review({ id: "claim-does-not-matter", decision: "APPROVED" }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.admin.auditLog({ limit: 10 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
