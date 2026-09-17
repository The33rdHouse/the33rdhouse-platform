import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { db, pool } from "../src/db/client";
import { sessions, users } from "../src/db/schema";
import { sessionDigest } from "../src/console/policy";
// Operator-only bootstrap: grants no roles and requires an existing account.
try {
  const userId = process.argv[2];
  if (!userId)
    throw new Error("Usage: pnpm console:session <existing-user-id>");
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!user) throw new Error("Existing user required");
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  await db
    .insert(sessions)
    .values({ id: sessionDigest(token), userId, expiresAt });
  console.log(
    "One-hour bearer credential. Enter in the console sign-in form; never commit or share in logs.",
  );
  console.log(token);
} finally {
  await pool.end();
}
