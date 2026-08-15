import { eq } from "drizzle-orm";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { db as defaultDb } from "../db/client";
import { roles, userRoles, users } from "../db/schema";
import type { CanonicalDatabase } from "../canon/promotion";

export type ApiContext = {
  database: CanonicalDatabase;
  userId: string | null;
  roles: Set<string>;
};

export async function createContext(input: {
  database?: CanonicalDatabase;
  userId?: string | null;
} = {}): Promise<ApiContext> {
  const database = input.database ?? defaultDb;
  const requestedUserId = input.userId ?? null;
  if (!requestedUserId) return { database, userId: null, roles: new Set() };

  const [user] = await database
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, requestedUserId))
    .limit(1);
  if (!user) return { database, userId: null, roles: new Set() };

  const persistedRoles = await database
    .select({ name: roles.name })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userId, user.id));

  return {
    database,
    userId: user.id,
    roles: new Set(persistedRoles.map((role) => role.name)),
  };
}

export async function createHttpContext(options: CreateExpressContextOptions): Promise<ApiContext> {
  const trustedUserId: unknown = options.res.locals.authUserId;
  return createContext({
    database: defaultDb,
    userId: typeof trustedUserId === "string" && trustedUserId ? trustedUserId : null,
  });
}
