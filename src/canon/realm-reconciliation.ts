import { realmId } from "./ids";

export type RealmSourceVariant = {
  sourceId: string;
  realmNumber: number;
  gate: number | string;
  name: string;
  gateName?: string;
  description?: string;
  [key: string]: unknown;
};

export type ReconciledRealm = {
  realmNumber: number;
  gate: number | string;
  name: string;
  gateName?: string;
  description?: string;
};

export type RealmConflictField = "name" | "gate" | "gateName" | "description";

export type RealmReconciliationResult = {
  realmId: string;
  realmNumber: number;
  status: "APPROVED" | "UNDER_REVIEW";
  conflicts: RealmConflictField[];
  canonical: ReconciledRealm | null;
  variants: RealmSourceVariant[];
};

function normalizedComparable(value: string | number | undefined): string | undefined {
  if (value === undefined) return undefined;
  return String(value).trim().normalize("NFC");
}

function conflictingField(
  variants: readonly RealmSourceVariant[],
  field: RealmConflictField,
): boolean {
  const values = variants
    .map((variant) => normalizedComparable(variant[field] as string | number | undefined))
    .filter((value): value is string => value !== undefined);

  return values.length > 1 && new Set(values).size > 1;
}

function completeConsensus(
  variants: readonly RealmSourceVariant[],
  field: RealmConflictField,
): string | number | undefined {
  const rawValues = variants.map((variant) => variant[field] as string | number | undefined);
  if (rawValues.some((value) => value === undefined)) return undefined;

  const normalized = rawValues.map((value) => normalizedComparable(value)!);
  if (new Set(normalized).size !== 1) return undefined;

  if (field === "gate") {
    const first = rawValues[0]!;
    return typeof first === "number" ? first : normalized[0]!;
  }
  return normalized[0]!;
}

export function reconcileRealmVariants(
  variants: readonly RealmSourceVariant[],
): RealmReconciliationResult {
  if (variants.length === 0) {
    throw new Error("At least one Realm source variant is required");
  }

  const realmNumber = variants[0]!.realmNumber;
  const stableRealmId = realmId(realmNumber);

  if (variants.some((variant) => variant.realmNumber !== realmNumber)) {
    throw new Error("Realm variants must share one realmNumber");
  }

  for (const variant of variants) {
    if (!variant.sourceId.trim()) throw new Error("Realm sourceId must not be empty");
    if (!variant.name.trim()) throw new Error("Realm name must not be empty");
  }

  const fields: RealmConflictField[] = ["name", "gate", "gateName", "description"];
  const conflicts = fields.filter((field) => conflictingField(variants, field));
  const preservedVariants = variants.map((variant) => ({ ...variant }));

  if (conflicts.length > 0) {
    return {
      realmId: stableRealmId,
      realmNumber,
      status: "UNDER_REVIEW",
      conflicts,
      canonical: null,
      variants: preservedVariants,
    };
  }

  const name = completeConsensus(variants, "name");
  const gate = completeConsensus(variants, "gate");
  if (typeof name !== "string" || (typeof gate !== "string" && typeof gate !== "number")) {
    throw new Error("Realm structural fields require complete agreement before promotion");
  }

  const gateName = completeConsensus(variants, "gateName");
  const description = completeConsensus(variants, "description");

  return {
    realmId: stableRealmId,
    realmNumber,
    status: "APPROVED",
    conflicts: [],
    canonical: {
      realmNumber,
      gate,
      name,
      ...(typeof gateName === "string" ? { gateName } : {}),
      ...(typeof description === "string" ? { description } : {}),
    },
    variants: preservedVariants,
  };
}
