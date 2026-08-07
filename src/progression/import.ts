import { ranks } from "../db/schema";
import { promoteCanonObjectInTransaction, type CanonicalDatabase } from "../canon/promotion";
import type { ParsedSourcePackage } from "../import/types";
import { rankRuleFromEscapeMatrix } from "./ranks";

export function rankRulesFromSources(parsedPackages: readonly ParsedSourcePackage[]) {
  const escapeMatrix = parsedPackages.find((item) => item.sourceId === "escape-matrix");
  if (!escapeMatrix) throw new Error("Escape Matrix source package is required for rank import");
  const records = escapeMatrix.records.filter((record) => record.kind === "rank");
  if (records.length !== 8) throw new Error(`Expected 8 Escape Matrix rank records; found ${records.length}`);
  return records
    .map((record) =>
      rankRuleFromEscapeMatrix({
        id: record.payload.id as string | number,
        name: String(record.payload.name ?? ""),
      }),
    )
    .sort((left, right) => left.ordinal - right.ordinal);
}

export async function persistRankRules(
  database: CanonicalDatabase,
  parsedPackages: readonly ParsedSourcePackage[],
  actor: string,
): Promise<number> {
  const rules = rankRulesFromSources(parsedPackages);
  await database.transaction(async (tx) => {
    for (const rule of rules) {
      await tx
        .insert(ranks)
        .values(rule)
        .onConflictDoUpdate({
          target: ranks.id,
          set: { ordinal: rule.ordinal, name: rule.name, unlockRule: rule.unlockRule },
        });
      await promoteCanonObjectInTransaction(
        tx,
        {
          objectId: rule.id,
          objectType: "rank",
          level: "STRUCTURAL",
          status: "APPROVED",
          payload: { ordinal: rule.ordinal, name: rule.name, unlockRule: rule.unlockRule },
        },
        actor,
      );
    }
  });
  return rules.length;
}
