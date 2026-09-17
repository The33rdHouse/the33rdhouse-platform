import { createHash } from "node:crypto";
import { z } from "zod";
export { readPreferences } from "../../shared/preferences";
export const TERMS_VERSION = "harmga-intake-2026-09-17";
export const intakeSchema = z.strictObject({
  name: z.string().trim().min(1).max(120),
  email: z.email().max(254),
  requestedRole: z.enum(["Keeper", "Advisory Witness", "Associate"]),
  accepted: z.literal(true),
  termsVersion: z.literal(TERMS_VERSION),
});
export function validSessionToken(token: unknown): token is string {
  return typeof token === "string" && /^[a-f0-9]{64}$/.test(token);
}
export function sessionDigest(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
export function sameOrigin(
  origin: string | undefined,
  expected: string | undefined,
): boolean {
  if (!origin || !expected) return false;
  try {
    return new URL(origin).origin === expected && origin === expected;
  } catch {
    return false;
  }
}
