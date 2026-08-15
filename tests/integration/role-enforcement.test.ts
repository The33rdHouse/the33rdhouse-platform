import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { inArray } from "drizzle-orm";
import { db } from "../../src/db/client";
import { roles, userRoles, users } from "../../src/db/schema";
import { createContext } from "../../src/api/context";
import { appRouter } from "../../src/api/router";

const adminUser = "release-admin-user";
const memberUser = "release-member-user";
const adminRole = "release-admin-role";
const memberRole = "release-member-role";

async function cleanup(): Promise<void> {
  await db.delete(userRoles).where(inArray(userRoles.userId, [adminUser, memberUser]));
  await db.delete(users).where(inArray(users.id, [adminUser, memberUser]));
  await db.delete(roles).where(inArray(roles.id, [adminRole, memberRole]));
}

beforeEach(async () => {
  await cleanup();
  await db.insert(users).values([
    { id: adminUser, email: "release-admin@example.test" },
    { id: memberUser, email: "release-member@example.test" },
  ]);
  await db.insert(roles).values([
    { id: adminRole, name: "admin" },
    { id: memberRole, name: "release-member" },
  ]);
  await db.insert(userRoles).values([
    { userId: adminUser, roleId: adminRole },
    { userId: memberUser, roleId: memberRole },
  ]);
});

afterEach(cleanup);

describe("release role enforcement", () => {
  it("permits persisted admins and rejects persisted non-admins", async () => {
    const adminCaller = appRouter.createCaller(await createContext({ database: db, userId: adminUser }));
    const memberCaller = appRouter.createCaller(await createContext({ database: db, userId: memberUser }));

    await expect(adminCaller.admin.auditLog({ limit: 10 })).resolves.toMatchObject({ items: expect.any(Array) });
    await expect(memberCaller.admin.auditLog({ limit: 10 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("does not treat an unknown claimed user ID as authenticated", async () => {
    const caller = appRouter.createCaller(
      await createContext({ database: db, userId: "not-a-persisted-user" }),
    );
    await expect(caller.admin.auditLog({ limit: 10 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
