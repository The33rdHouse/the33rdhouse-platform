import { join } from "node:path";
import { inventoryEvidenceDirectory } from "../src/import/evidence";
import { parseBackend } from "../src/import/parsers/backend";
import { parseDeityAtlas } from "../src/import/parsers/deity-atlas";
import { parseEscapeMatrix } from "../src/import/parsers/escape-matrix";
import { importSources, planRealmReconciliations } from "../src/import/pipeline";
import type { ParsedSourcePackage } from "../src/import/types";
import { persistRankRules, rankRulesFromSources } from "../src/progression/import";

const commit = process.argv.includes("--commit");
const dryRun = process.argv.includes("--dry-run") || !commit;
if (commit && process.argv.includes("--dry-run")) {
  throw new Error("Choose exactly one import mode: --dry-run or --commit");
}

const sourceEvidenceDir = process.env.SOURCE_EVIDENCE_DIR ?? "source-evidence";
const evidence = await inventoryEvidenceDirectory(sourceEvidenceDir);
const byId = new Map(evidence.map((item) => [item.id, item.filePath]));

function evidencePath(id: string): string {
  const filePath = byId.get(id);
  if (!filePath) throw new Error(`Verified evidence package missing: ${id}`);
  return filePath;
}

const parsedPackages: ParsedSourcePackage[] = [
  await parseBackend(evidencePath("complete-backend")),
  await parseEscapeMatrix(evidencePath("escape-matrix")),
  await parseDeityAtlas(evidencePath("deity-atlas")),
];

if (dryRun) {
  const reconciliations = planRealmReconciliations(parsedPackages);
  const rankRules = rankRulesFromSources(parsedPackages);
  process.stdout.write(
    `${JSON.stringify(
      {
        mode: "dry-run",
        sourceEvidenceDir: join(process.cwd(), sourceEvidenceDir),
        packageCount: parsedPackages.length,
        sourceRecords: parsedPackages.reduce((sum, item) => sum + item.records.length, 0),
        media: parsedPackages.reduce((sum, item) => sum + item.media.length, 0),
        realmIdentities: reconciliations.length,
        realmConflicts: reconciliations.filter((item) => item.status === "UNDER_REVIEW").length,
        rankRules: rankRules.map(({ id, ordinal, name }) => ({ id, ordinal, name })),
        warnings: parsedPackages.flatMap((item) => item.warnings),
      },
      null,
      2,
    )}\n`,
  );
} else {
  const { db, pool } = await import("../src/db/client");
  const actor = process.env.IMPORT_ACTOR ?? "system-import";
  try {
    const report = await importSources(db, parsedPackages, actor);
    const rankRules = await persistRankRules(db, parsedPackages, actor);
    process.stdout.write(`${JSON.stringify({ mode: "commit", ...report, rankRules }, null, 2)}\n`);
  } finally {
    await pool.end();
  }
}
