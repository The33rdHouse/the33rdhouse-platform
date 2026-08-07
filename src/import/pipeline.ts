import { createHash } from "node:crypto";
import { and, eq } from "drizzle-orm";
import {
  canonSourceRecords,
  gates,
  realmSourceVariants,
  realms,
} from "../db/schema";
import { gateId, realmId } from "../canon/ids";
import {
  reconcileRealmVariants,
  type RealmReconciliationResult,
  type RealmSourceVariant,
} from "../canon/realm-reconciliation";
import {
  promoteCanonObjectInTransaction,
  type CanonicalDatabase,
} from "../canon/promotion";
import type { ParsedSourcePackage, StagingRecord } from "./types";

export type ImportReport = {
  packageCount: number;
  sourceRecords: number;
  realmIdentities: number;
  conflicts: number;
  warnings: string[];
};

function hashText(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function recordHash(record: StagingRecord): string {
  return hashText(JSON.stringify(record.payload));
}

function sourceRecordDatabaseId(packageId: string, record: StagingRecord): string {
  const naturalKey = `${packageId}\0${record.sourcePath}\0${record.sourceRecordId}`;
  return `source-${hashText(naturalKey).slice(0, 32)}`;
}

function requiredInteger(value: unknown, label: string): number {
  const numeric = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
  if (!Number.isInteger(numeric)) throw new Error(`${label} must be an integer`);
  return numeric;
}

function requiredString(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${label} must be a non-empty string`);
  return value;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export function realmVariantFromStaging(
  packageId: string,
  record: StagingRecord,
): RealmSourceVariant | null {
  const payload = record.payload;

  if (record.kind === "realm_variant") {
    return {
      sourceId: `${packageId}:${record.sourcePath}:${record.sourceRecordId}`,
      realmNumber: requiredInteger(payload.number, "Realm number"),
      gate: requiredInteger(payload.gate, "Realm gate"),
      name: requiredString(payload.name, "Realm name"),
      gateName: optionalString(payload.gateName),
      description: optionalString(payload.description) ?? optionalString(payload.essence),
    };
  }

  if (record.kind === "meditation_realm_variant") {
    return {
      sourceId: `${packageId}:${record.sourcePath}:${record.sourceRecordId}`,
      realmNumber: requiredInteger(payload.realm, "Meditation Realm number"),
      gate: requiredInteger(payload.gate, "Meditation Realm gate"),
      name: requiredString(payload.name, "Meditation Realm name"),
      gateName: optionalString(payload.gateName),
      description: optionalString(payload.description),
    };
  }

  if (record.kind === "backend_realm_variant") {
    return {
      sourceId: `${packageId}:${record.sourcePath}:${record.sourceRecordId}`,
      realmNumber: requiredInteger(payload.realmNumber, "Backend Realm number"),
      gate: requiredInteger(payload.gateId, "Backend Realm gate"),
      name: requiredString(payload.name, "Backend Realm name"),
      gateName: optionalString(payload.gateName),
      description: optionalString(payload.description),
    };
  }

  return null;
}

function canonicalGateOrdinal(realmNumber: number): number {
  realmId(realmNumber);
  return Math.floor((realmNumber - 1) / 12) + 1;
}

export function planRealmReconciliations(
  parsedPackages: readonly ParsedSourcePackage[],
): RealmReconciliationResult[] {
  const grouped = new Map<number, RealmSourceVariant[]>();

  for (const parsedPackage of parsedPackages) {
    for (const record of parsedPackage.records) {
      const variant = realmVariantFromStaging(parsedPackage.sourceId, record);
      if (!variant) continue;
      const variants = grouped.get(variant.realmNumber) ?? [];
      variants.push(variant);
      grouped.set(variant.realmNumber, variants);
    }
  }

  return [...grouped.entries()]
    .sort(([left], [right]) => left - right)
    .map(([, variants]) => reconcileRealmVariants(variants));
}

export async function importSources(
  database: CanonicalDatabase,
  parsedPackages: readonly ParsedSourcePackage[],
  actor: string,
): Promise<ImportReport> {
  if (!actor.trim()) throw new Error("Import actor must not be empty");

  const affectedRealmNumbers = new Set<number>();
  let sourceRecords = 0;

  for (const parsedPackage of parsedPackages) {
    await database.transaction(async (tx) => {
      for (const record of parsedPackage.records) {
        const sha256 = recordHash(record);
        const databaseId = sourceRecordDatabaseId(parsedPackage.sourceId, record);
        const [existing] = await tx
          .select()
          .from(canonSourceRecords)
          .where(
            and(
              eq(canonSourceRecords.packageId, parsedPackage.sourceId),
              eq(canonSourceRecords.sourcePath, record.sourcePath),
              eq(canonSourceRecords.sourceRecordId, record.sourceRecordId),
            ),
          );

        if (existing && existing.sha256 !== sha256) {
          throw new Error(
            `Immutable source record mismatch: ${parsedPackage.sourceId}/${record.sourcePath}/${record.sourceRecordId}`,
          );
        }

        if (!existing) {
          await tx.insert(canonSourceRecords).values({
            id: databaseId,
            packageId: parsedPackage.sourceId,
            sourcePath: record.sourcePath,
            sourceRecordId: record.sourceRecordId,
            sha256,
            rawJson: record.payload,
          });
        }
        sourceRecords += 1;

        const variant = realmVariantFromStaging(parsedPackage.sourceId, record);
        if (!variant) continue;

        const stableRealmId = realmId(variant.realmNumber);
        const structuralGateOrdinal = canonicalGateOrdinal(variant.realmNumber);
        const stableGateId = gateId(structuralGateOrdinal);
        affectedRealmNumbers.add(variant.realmNumber);

        await tx
          .insert(gates)
          .values({
            id: stableGateId,
            ordinal: structuralGateOrdinal,
            canonicalName: `Gate ${String(structuralGateOrdinal).padStart(2, "0")}`,
          })
          .onConflictDoNothing();

        await tx
          .insert(realms)
          .values({
            id: stableRealmId,
            realmNumber: variant.realmNumber,
            gateId: stableGateId,
            canonicalName: null,
            canonicalDescription: null,
          })
          .onConflictDoNothing();

        const sourceRecordId = existing?.id ?? databaseId;
        await tx
          .insert(realmSourceVariants)
          .values({
            realmId: stableRealmId,
            sourceRecordId,
            rawName: variant.name,
            rawDescription: variant.description,
            rawGateOrdinal: requiredInteger(variant.gate, "Realm source gate"),
            rawMetadata: record.payload,
          })
          .onConflictDoNothing();
      }
    });
  }

  let conflicts = 0;

  if (affectedRealmNumbers.size > 0) {
    await database.transaction(async (tx) => {
      for (const realmNumber of [...affectedRealmNumbers].sort((a, b) => a - b)) {
        const stableRealmId = realmId(realmNumber);
        const rows = await tx
          .select({
            packageId: canonSourceRecords.packageId,
            sourceRecordId: canonSourceRecords.sourceRecordId,
            rawName: realmSourceVariants.rawName,
            rawDescription: realmSourceVariants.rawDescription,
            rawGateOrdinal: realmSourceVariants.rawGateOrdinal,
            rawMetadata: realmSourceVariants.rawMetadata,
          })
          .from(realmSourceVariants)
          .innerJoin(canonSourceRecords, eq(realmSourceVariants.sourceRecordId, canonSourceRecords.id))
          .where(eq(realmSourceVariants.realmId, stableRealmId));

        const variants: RealmSourceVariant[] = rows.map((row) => {
          const metadata =
            row.rawMetadata && typeof row.rawMetadata === "object" && !Array.isArray(row.rawMetadata)
              ? (row.rawMetadata as Record<string, unknown>)
              : {};
          if (row.rawGateOrdinal === null || row.rawName === null) {
            throw new Error(`Incomplete Realm source variant for ${stableRealmId}`);
          }
          return {
            sourceId: `${row.packageId}:${row.sourceRecordId}`,
            realmNumber,
            gate: row.rawGateOrdinal,
            name: row.rawName,
            gateName: optionalString(metadata.gateName),
            description: row.rawDescription ?? undefined,
          };
        });

        const reconciliation = reconcileRealmVariants(variants);
        if (reconciliation.status === "UNDER_REVIEW") conflicts += 1;

        const structuralGateOrdinal = canonicalGateOrdinal(realmNumber);
        const stableGateId = gateId(structuralGateOrdinal);

        await tx
          .update(realms)
          .set({
            gateId: stableGateId,
            canonicalName: reconciliation.canonical?.name ?? null,
            canonicalDescription: reconciliation.canonical?.description ?? null,
          })
          .where(eq(realms.id, stableRealmId));

        await promoteCanonObjectInTransaction(
          tx,
          {
            objectId: stableRealmId,
            objectType: "realm",
            level: "STRUCTURAL",
            status: reconciliation.status,
            payload: {
              realmNumber,
              gateId: stableGateId,
              conflicts: reconciliation.conflicts,
              canonical: reconciliation.canonical,
            },
          },
          actor,
        );
      }
    });
  }

  return {
    packageCount: parsedPackages.length,
    sourceRecords,
    realmIdentities: affectedRealmNumbers.size,
    conflicts,
    warnings: parsedPackages.flatMap((parsedPackage) => parsedPackage.warnings),
  };
}
