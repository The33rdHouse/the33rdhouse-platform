import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const pageInputSchema = z.object({
  limit: z.number().int().min(1).max(100).default(25),
  cursor: z.string().min(1).optional(),
});

export function encodeCursor(value: string | number): string {
  const type = typeof value === "number" ? "n" : "s";
  return Buffer.from(`${type}:${String(value)}`, "utf8").toString("base64url");
}

export function decodeStringCursor(cursor: string | undefined): string | undefined {
  if (!cursor) return undefined;
  try {
    const decoded = Buffer.from(cursor, "base64url").toString("utf8");
    if (!decoded.startsWith("s:") || decoded.length <= 2) throw new Error("invalid");
    return decoded.slice(2);
  } catch {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid cursor" });
  }
}

export function decodeNumberCursor(cursor: string | undefined): number | undefined {
  if (!cursor) return undefined;
  try {
    const decoded = Buffer.from(cursor, "base64url").toString("utf8");
    if (!decoded.startsWith("n:")) throw new Error("invalid");
    const value = Number(decoded.slice(2));
    if (!Number.isFinite(value)) throw new Error("invalid");
    return value;
  } catch {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid cursor" });
  }
}
