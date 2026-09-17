import { afterAll, beforeAll, it, expect } from "vitest";
import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import type { Server } from "node:http";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "../../src/api/router";
import { createApp } from "../../src/app";
import { db } from "../../src/db/client";
import { sessions, users, auditLog } from "../../src/db/schema";
import { sessionDigest } from "../../src/console/policy";
let server: Server;
let origin: string;
const id = "console-http-test";
const other = "console-http-other";
const token = randomBytes(32).toString("hex");
const expired = randomBytes(32).toString("hex");
const originalOrigin = process.env.APP_ORIGIN;
beforeAll(async () => {
  await db.delete(users).where(eq(users.id, id));
  await db.delete(users).where(eq(users.id, other));
  await db.insert(users).values([{ id }, { id: other }]);
  await db.insert(sessions).values([
    {
      id: sessionDigest(token),
      userId: id,
      expiresAt: new Date(Date.now() + 60000),
    },
    {
      id: sessionDigest(expired),
      userId: id,
      expiresAt: new Date(Date.now() - 60000),
    },
  ]);
  server = createApp().listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error();
  origin = `http://127.0.0.1:${address.port}`;
  process.env.APP_ORIGIN = origin;
});
afterAll(async () => {
  if (server)
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  await db.delete(users).where(eq(users.id, id));
  await db.delete(users).where(eq(users.id, other));
  await db.delete(auditLog).where(eq(auditLog.actorUserId, id));
  if (originalOrigin === undefined) delete process.env.APP_ORIGIN;
  else process.env.APP_ORIGIN = originalOrigin;
});
function client(cookie?: string, spoof?: string) {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: origin + "/trpc",
        transformer: superjson,
        headers: () => ({
          origin,
          ...(cookie ? { cookie } : {}),
          ...(spoof ? { "x-user-id": spoof } : {}),
        }),
      }),
    ],
  });
}
it("rejects spoofing, expiry and cross-origin login; persists intake without granting authority; revokes on logout", async () => {
  await expect(client(undefined, id).console.me.query()).rejects.toMatchObject({
    data: { code: "UNAUTHORIZED" },
  });
  expect(
    (
      await fetch(origin + "/api/exhibits/L-01", {
        headers: { "x-user-id": id },
      })
    ).status,
  ).toBe(401);
  const login = (credential: string, requestOrigin = origin) =>
    fetch(origin + "/auth/session", {
      method: "POST",
      headers: { "content-type": "application/json", origin: requestOrigin },
      body: JSON.stringify({ token: credential }),
    });
  expect((await login(token, "https://evil.example")).status).toBe(403);
  expect((await login(expired)).status).toBe(401);
  const response = await login(token);
  expect(response.status).toBe(204);
  const setCookie = response.headers.get("set-cookie")!;
  expect(setCookie).toContain("HttpOnly");
  expect(setCookie).toContain("SameSite=Strict");
  const cookie = setCookie.split(";")[0]!;
  const api = client(cookie);
  expect((await api.console.me.query()).user?.id).toBe(id);
  expect(
    (await fetch(origin + "/api/exhibits/L-01", { headers: { cookie } }))
      .status,
  ).toBe(404);
  const row = await api.console.submitApplication.mutate({
    name: "Test Person",
    email: "person@example.test",
    requestedRole: "Keeper",
    accepted: true,
    termsVersion: "harmga-intake-2026-09-17",
  });
  expect(row.status).toBe("PENDING_REVIEW");
  expect((await api.console.me.query()).roles).toEqual([]);
  expect(await client(cookie).console.applications.query()).toHaveLength(1);
  await expect(
    api.console.submitApplication.mutate({
      name: "Again",
      email: "again@example.test",
      requestedRole: "Keeper",
      accepted: true,
      termsVersion: "harmga-intake-2026-09-17",
    }),
  ).rejects.toMatchObject({ data: { code: "CONFLICT" } });
  const logs = await db
    .select()
    .from(auditLog)
    .where(eq(auditLog.actorUserId, id));
  expect(logs).toHaveLength(1);
  const otherToken = randomBytes(32).toString("hex");
  await db
    .insert(sessions)
    .values({
      id: sessionDigest(otherToken),
      userId: other,
      expiresAt: new Date(Date.now() + 60000),
    });
  expect(
    await client("harmga_session=" + otherToken).console.applications.query(),
  ).toHaveLength(0);
  expect(
    (
      await fetch(origin + "/auth/logout", {
        method: "POST",
        headers: { cookie, origin: "https://evil.example" },
      })
    ).status,
  ).toBe(403);
  expect(
    (
      await fetch(origin + "/auth/logout", {
        method: "POST",
        headers: { cookie, origin },
      })
    ).status,
  ).toBe(204);
  await expect(api.console.me.query()).rejects.toMatchObject({
    data: { code: "UNAUTHORIZED" },
  });
});
