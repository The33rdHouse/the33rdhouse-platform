import { createHash } from "node:crypto";
import { z } from "zod";
import { MAPPING_CONFIDENCE, MAPPING_TYPES } from "../db/schema";

function slug(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/\p{M}+/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function deterministicKnowledgeId(
  prefix: string,
  label: string,
  naturalKey: string,
): string {
  if (!prefix.trim()) throw new Error("Knowledge ID prefix must not be empty");
  if (!naturalKey.trim()) throw new Error("Knowledge natural key must not be empty");

  const readable = slug(naturalKey) || slug(label) || "item";
  const suffix = createHash("sha256").update(naturalKey.normalize("NFC")).digest("hex").slice(0, 10);
  return `${slug(prefix) || "object"}-${readable}-${suffix}`;
}

export function normalizedKnowledgeText(value: string): string {
  return value.trim().normalize("NFC");
}

export function normalizedKnowledgeKey(value: string): string {
  return normalizedKnowledgeText(value).toLocaleLowerCase("en-US");
}

const mappingClaimInputSchema = z.object({
  type: z.enum(MAPPING_TYPES),
  confidence: z.enum(MAPPING_CONFIDENCE),
});

export type MappingClaimInput = z.infer<typeof mappingClaimInputSchema>;

export function parseMappingClaim(input: unknown): MappingClaimInput {
  return mappingClaimInputSchema.parse(input);
}
