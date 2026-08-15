import { eq } from "drizzle-orm";
import {
  citations,
  concepts,
  correspondences,
  deities,
  deityAliases,
  eras,
  gates,
  mappingClaims,
  paths,
  sources,
  traditions,
} from "../db/schema";
import { gateId, pathId } from "../canon/ids";
import {
  deterministicKnowledgeId,
  normalizedKnowledgeKey,
  normalizedKnowledgeText,
  parseMappingClaim,
} from "../canon/knowledge";
import {
  promoteCanonObjectInTransaction,
  type CanonicalDatabase,
  type CanonicalTransaction,
} from "../canon/promotion";
import type { ParsedSourcePackage, StagingRecord } from "./types";

const PATH_ORDINALS: Readonly<Record<string, number>> = {
  mesopotamian: 1,
  egyptian: 2,
  greek: 3,
  norse: 4,
  hebrew: 5,
  christian: 6,
  gnostic: 7,
  sufi: 8,
  hermetic: 9,
  eastern: 10,
  indigenous: 11,
  modern: 12,
};

export type KnowledgeImportReport = {
  deities: number;
  traditions: number;
  eras: number;
  sources: number;
  mappingClaims: number;
  conflicts: number;
};

function requiredString(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${label} must be a non-empty string`);
  return value;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function integer(value: unknown, label: string): number {
  const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
  if (!Number.isInteger(parsed)) throw new Error(`${label} must be an integer`);
  return parsed;
}

function objectPayload(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object`);
  return value as Record<string, unknown>;
}

async function ensureTradition(
  tx: CanonicalTransaction,
  naturalKey: string,
  displayName: string,
  actor: string,
  sourceRef: string,
): Promise<{ id: string; created: boolean; conflict: boolean }> {
  const id = deterministicKnowledgeId("tradition", displayName, naturalKey);
  const normalizedName = normalizedKnowledgeText(displayName);
  const [existing] = await tx.select().from(traditions).where(eq(traditions.id, id));

  if (!existing) {
    await tx.insert(traditions).values({ id, canonicalName: normalizedName });
    await promoteCanonObjectInTransaction(
      tx,
      {
        objectId: id,
        objectType: "tradition",
        level: "CONTENT",
        status: "APPROVED",
        payload: { canonicalName: normalizedName, naturalKey, sourceRef },
      },
      actor,
    );
    return { id, created: true, conflict: false };
  }

  if (normalizedKnowledgeKey(existing.canonicalName) !== normalizedKnowledgeKey(normalizedName)) {
    await promoteCanonObjectInTransaction(
      tx,
      {
        objectId: id,
        objectType: "tradition",
        level: "CONTENT",
        status: "UNDER_REVIEW",
        payload: {
          canonicalName: existing.canonicalName,
          proposedName: normalizedName,
          naturalKey,
          sourceRef,
          conflict: "canonicalName",
        },
      },
      actor,
    );
    return { id, created: false, conflict: true };
  }

  return { id, created: false, conflict: false };
}

async function ensureEra(
  tx: CanonicalTransaction,
  naturalKey: string,
  displayName: string,
  actor: string,
  sourceRef: string,
): Promise<{ id: string; created: boolean; conflict: boolean }> {
  const id = deterministicKnowledgeId("era", displayName, naturalKey);
  const name = normalizedKnowledgeText(displayName);
  const [existing] = await tx.select().from(eras).where(eq(eras.id, id));

  if (!existing) {
    await tx.insert(eras).values({ id, canonicalName: name });
    await promoteCanonObjectInTransaction(
      tx,
      {
        objectId: id,
        objectType: "era",
        level: "STRUCTURAL",
        status: "APPROVED",
        payload: { canonicalName: name, naturalKey, sourceRef },
      },
      actor,
    );
    return { id, created: true, conflict: false };
  }

  if (normalizedKnowledgeKey(existing.canonicalName) !== normalizedKnowledgeKey(name)) {
    if (normalizedKnowledgeKey(existing.canonicalName) === normalizedKnowledgeKey(naturalKey)) {
      await tx.update(eras).set({ canonicalName: name }).where(eq(eras.id, id));
      await promoteCanonObjectInTransaction(
        tx,
        {
          objectId: id,
          objectType: "era",
          level: "STRUCTURAL",
          status: "APPROVED",
          payload: { canonicalName: name, naturalKey, sourceRef },
        },
        actor,
      );
      return { id, created: false, conflict: false };
    }

    await promoteCanonObjectInTransaction(
      tx,
      {
        objectId: id,
        objectType: "era",
        level: "STRUCTURAL",
        status: "UNDER_REVIEW",
        payload: {
          canonicalName: existing.canonicalName,
          proposedName: name,
          naturalKey,
          sourceRef,
          conflict: "canonicalName",
        },
      },
      actor,
    );
    return { id, created: false, conflict: true };
  }

  return { id, created: false, conflict: false };
}

async function importGateRecord(
  tx: CanonicalTransaction,
  record: StagingRecord,
  actor: string,
): Promise<void> {
  const ordinal = integer(record.payload.id, "Gate id");
  const id = gateId(ordinal);
  const name = normalizedKnowledgeText(requiredString(record.payload.name, "Gate name"));
  const [existing] = await tx.select().from(gates).where(eq(gates.id, id));
  const placeholder = `Gate ${String(ordinal).padStart(2, "0")}`;

  if (!existing) {
    await tx.insert(gates).values({ id, ordinal, canonicalName: name });
  } else if (existing.canonicalName === placeholder) {
    await tx.update(gates).set({ canonicalName: name }).where(eq(gates.id, id));
  } else if (normalizedKnowledgeKey(existing.canonicalName) !== normalizedKnowledgeKey(name)) {
    await promoteCanonObjectInTransaction(
      tx,
      {
        objectId: id,
        objectType: "gate",
        level: "STRUCTURAL",
        status: "UNDER_REVIEW",
        payload: { canonicalName: existing.canonicalName, proposedName: name },
      },
      actor,
    );
    return;
  }

  const [canonGate] = await tx.select().from(gates).where(eq(gates.id, id));
  if (canonGate) {
    await promoteCanonObjectInTransaction(
      tx,
      {
        objectId: id,
        objectType: "gate",
        level: "STRUCTURAL",
        status: "APPROVED",
        payload: { ordinal, canonicalName: canonGate.canonicalName },
      },
      actor,
    );
  }
}

async function importPathRecord(
  tx: CanonicalTransaction,
  record: StagingRecord,
  actor: string,
): Promise<void> {
  const naturalKey = requiredString(record.payload.id, "Path id");
  const ordinal = PATH_ORDINALS[naturalKey];
  if (!ordinal) throw new Error(`Unknown canonical Path identity: ${naturalKey}`);
  const id = pathId(ordinal);
  const name = normalizedKnowledgeText(requiredString(record.payload.name, "Path name"));
  const [existing] = await tx.select().from(paths).where(eq(paths.id, id));

  if (!existing) {
    await tx.insert(paths).values({
      id,
      ordinal,
      canonicalName: name,
      description: optionalString(record.payload.description),
    });
    await promoteCanonObjectInTransaction(
      tx,
      {
        objectId: id,
        objectType: "path",
        level: "STRUCTURAL",
        status: "APPROVED",
        payload: { ordinal, naturalKey, canonicalName: name },
      },
      actor,
    );
  }
}

async function importDeityRecord(
  tx: CanonicalTransaction,
  record: StagingRecord,
  actor: string,
): Promise<{ created: boolean; conflict: boolean; traditionCreated: boolean }> {
  const naturalKey = requiredString(record.payload.id, "Deity id");
  const name = normalizedKnowledgeText(requiredString(record.payload.name_primary, "Deity name"));
  const id = deterministicKnowledgeId("deity", name, naturalKey);
  const sourceRef = `${record.sourcePath}:${record.sourceRecordId}`;

  let traditionId: string | undefined;
  let traditionCreated = false;
  const traditionName = optionalString(record.payload.tradition_complex);
  if (traditionName) {
    const ensured = await ensureTradition(tx, traditionName, traditionName, actor, sourceRef);
    traditionId = ensured.id;
    traditionCreated = ensured.created;
  }

  let eraId: string | undefined;
  const eraNaturalKey = optionalString(record.payload.era_id);
  if (eraNaturalKey) {
    const ensured = await ensureEra(tx, eraNaturalKey, eraNaturalKey, actor, sourceRef);
    eraId = ensured.id;
  }

  const [existing] = await tx.select().from(deities).where(eq(deities.id, id));
  let conflict = false;
  let created = false;

  if (!existing) {
    await tx.insert(deities).values({
      id,
      canonicalName: name,
      traditionId,
      eraId,
      description: optionalString(record.payload.notes),
    });
    await promoteCanonObjectInTransaction(
      tx,
      {
        objectId: id,
        objectType: "deity",
        level: "CONTENT",
        status: "APPROVED",
        payload: { canonicalName: name, naturalKey, traditionId, eraId, sourceRef },
      },
      actor,
    );
    created = true;
  } else if (normalizedKnowledgeKey(existing.canonicalName) !== normalizedKnowledgeKey(name)) {
    await promoteCanonObjectInTransaction(
      tx,
      {
        objectId: id,
        objectType: "deity",
        level: "CONTENT",
        status: "UNDER_REVIEW",
        payload: {
          canonicalName: existing.canonicalName,
          proposedName: name,
          naturalKey,
          sourceRef,
          conflict: "canonicalName",
        },
      },
      actor,
    );
    conflict = true;
  }

  const aliases = optionalString(record.payload.name_variants)
    ?.split(";")
    .map((alias) => normalizedKnowledgeText(alias))
    .filter(Boolean) ?? [];
  if (aliases.length > 0) {
    const existingAliases = await tx.select().from(deityAliases).where(eq(deityAliases.deityId, id));
    const keys = new Set(existingAliases.map((alias) => normalizedKnowledgeKey(alias.alias)));
    for (const alias of aliases) {
      const key = normalizedKnowledgeKey(alias);
      if (keys.has(key) || key === normalizedKnowledgeKey(name)) continue;
      await tx.insert(deityAliases).values({ deityId: id, alias });
      keys.add(key);
    }
  }

  return { created, conflict, traditionCreated };
}

async function importResearchLibraryRecord(
  tx: CanonicalTransaction,
  record: StagingRecord,
): Promise<number> {
  const documents = record.payload.documents;
  if (!Array.isArray(documents)) return 0;
  let inserted = 0;

  for (const raw of documents) {
    const document = objectPayload(raw, "Research document");
    const naturalKey = requiredString(document.id, "Research document id");
    const title = normalizedKnowledgeText(requiredString(document.title, "Research document title"));
    const sourceId = deterministicKnowledgeId("source", title, naturalKey);
    const [existing] = await tx.select().from(sources).where(eq(sources.id, sourceId));
    if (!existing) {
      const generated = optionalString(document.generated);
      await tx.insert(sources).values({
        id: sourceId,
        title,
        author: optionalString(document.author),
        locator: optionalString(document.url) ?? optionalString(document.subtitle),
        publicationYear: generated?.slice(0, 4),
      });
      const citationId = deterministicKnowledgeId("citation", naturalKey, naturalKey);
      await tx.insert(citations).values({
        id: citationId,
        sourceId,
        locator: optionalString(document.subtitle),
      }).onConflictDoNothing();
      inserted += 1;
    }
  }

  return inserted;
}

async function importTraditionMappings(
  tx: CanonicalTransaction,
  record: StagingRecord,
  traditionId: string,
): Promise<number> {
  const naturalKey = requiredString(record.payload.id, "Tradition id");
  const crossConnections = record.payload.cross_connections;
  if (Array.isArray(crossConnections)) {
    for (const rawTarget of crossConnections) {
      if (typeof rawTarget !== "string" || !rawTarget.trim()) continue;
      const conceptId = deterministicKnowledgeId("concept", rawTarget, rawTarget);
      await tx.insert(concepts).values({ id: conceptId, canonicalName: rawTarget }).onConflictDoNothing();
      const relationNaturalKey = `${naturalKey}->${rawTarget}`;
      await tx
        .insert(correspondences)
        .values({
          id: deterministicKnowledgeId("correspondence", relationNaturalKey, relationNaturalKey),
          fromObjectId: traditionId,
          toObjectId: conceptId,
          relationType: "CROSS_CONNECTION",
        })
        .onConflictDoNothing();
    }
  }

  const rationale = optionalString(record.payload.connection_to_33rd);
  if (!rationale) return 0;
  const gateOrdinal = integer(record.payload.gate, "Tradition Gate");
  const validated = parseMappingClaim({ type: "SYMBOLIC_RESONANCE", confidence: "C" });
  const targetGateId = gateId(gateOrdinal);
  const claimNaturalKey = `${naturalKey}->${targetGateId}`;

  await tx
    .insert(mappingClaims)
    .values({
      id: deterministicKnowledgeId("claim", claimNaturalKey, claimNaturalKey),
      fromObjectId: traditionId,
      toObjectId: targetGateId,
      mappingType: validated.type,
      confidence: validated.confidence,
      status: "UNDER_REVIEW",
      rationale,
    })
    .onConflictDoNothing();
  return 1;
}

export async function importKnowledgeRecords(
  database: CanonicalDatabase,
  parsedPackages: readonly ParsedSourcePackage[],
  actor: string,
): Promise<KnowledgeImportReport> {
  const report: KnowledgeImportReport = {
    deities: 0,
    traditions: 0,
    eras: 0,
    sources: 0,
    mappingClaims: 0,
    conflicts: 0,
  };

  for (const parsedPackage of parsedPackages) {
    await database.transaction(async (tx) => {
      for (const record of parsedPackage.records.filter((item) => item.kind === "gate")) {
        await importGateRecord(tx, record, actor);
      }
      for (const record of parsedPackage.records.filter((item) => item.kind === "path")) {
        await importPathRecord(tx, record, actor);
      }
      for (const record of parsedPackage.records.filter((item) => item.kind === "era")) {
        const naturalKey = requiredString(record.payload.id, "Era id");
        const name = requiredString(record.payload.name, "Era name");
        const ensured = await ensureEra(
          tx,
          naturalKey,
          name,
          actor,
          `${record.sourcePath}:${record.sourceRecordId}`,
        );
        if (ensured.created) report.eras += 1;
        if (ensured.conflict) report.conflicts += 1;
      }
      for (const record of parsedPackage.records.filter((item) => item.kind === "tradition")) {
        const naturalKey = requiredString(record.payload.id, "Tradition id");
        const name = requiredString(record.payload.name, "Tradition name");
        const ensured = await ensureTradition(
          tx,
          naturalKey,
          name,
          actor,
          `${record.sourcePath}:${record.sourceRecordId}`,
        );
        if (ensured.created) report.traditions += 1;
        if (ensured.conflict) report.conflicts += 1;
        report.mappingClaims += await importTraditionMappings(tx, record, ensured.id);
      }
      for (const record of parsedPackage.records.filter((item) => item.kind === "deity")) {
        const imported = await importDeityRecord(tx, record, actor);
        if (imported.created) report.deities += 1;
        if (imported.traditionCreated) report.traditions += 1;
        if (imported.conflict) report.conflicts += 1;
      }
      for (const record of parsedPackage.records.filter((item) => item.kind === "research_library")) {
        report.sources += await importResearchLibraryRecord(tx, record);
      }
    });
  }

  return report;
}
