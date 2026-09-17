import type { Express, RequestHandler } from "express";
import { and, eq, gt } from "drizzle-orm";
import { db } from "../db/client";
import { sessions } from "../db/schema";
import { sameOrigin, sessionDigest, validSessionToken } from "./policy";
const cookieName = "harmga_session";
export function sessionCookie(header: string | undefined): string | undefined {
  const values = (header ?? "")
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.startsWith(cookieName + "="));
  if (values.length !== 1) return;
  const token = values[0]?.slice(cookieName.length + 1);
  return validSessionToken(token) ? token : undefined;
}
export async function lookupSession(token: unknown) {
  if (!validSessionToken(token)) return null;
  const [session] = await db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.id, sessionDigest(token)),
        gt(sessions.expiresAt, new Date()),
      ),
    )
    .limit(1);
  return session ?? null;
}
export const authenticate: RequestHandler = async (request, response, next) => {
  try {
    const session = await lookupSession(sessionCookie(request.headers.cookie));
    response.locals.authUserId = session?.userId ?? null;
    next();
  } catch {
    response.status(503).json({ error: "Session service unavailable" });
  }
};
export const requireSameOrigin: RequestHandler = (request, response, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return next();
  if (!sameOrigin(request.headers.origin, process.env.APP_ORIGIN)) {
    response.status(403).json({ error: "Same-origin request required" });
    return;
  }
  next();
};
export function installSessionRoutes(app: Express) {
  app.post("/auth/session", async (request, response) => {
    response.setHeader("Cache-Control", "no-store");
    try {
      const session = await lookupSession(request.body?.token);
      if (!session) {
        response.status(401).json({ error: "Invalid or expired session" });
        return;
      }
      response.cookie(cookieName, request.body.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        expires: session.expiresAt,
      });
      response.status(204).end();
    } catch {
      response.status(503).json({ error: "Session service unavailable" });
    }
  });
  app.post("/auth/logout", async (request, response) => {
    response.setHeader("Cache-Control", "no-store");
    try {
      const token = sessionCookie(request.headers.cookie);
      if (token)
        await db.delete(sessions).where(eq(sessions.id, sessionDigest(token)));
      response.clearCookie(cookieName, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });
      response.status(204).end();
    } catch {
      response.status(503).json({ error: "Session service unavailable" });
    }
  });
}
