import { inventoryEvidenceDirectory } from "../src/import/evidence";
import { parseBackend } from "../src/import/parsers/backend";
import { syncMedia } from "../src/media/sync";

const commit = process.argv.includes("--commit");
const dryRun = process.argv.includes("--dry-run") || !commit;
if (commit && process.argv.includes("--dry-run")) {
  throw new Error("Choose exactly one media sync mode: --dry-run or --commit");
}

const sourceEvidenceDir = process.env.SOURCE_EVIDENCE_DIR ?? "source-evidence";
const evidence = await inventoryEvidenceDirectory(sourceEvidenceDir);
const backend = evidence.find((item) => item.id === "complete-backend");
if (!backend) throw new Error("Verified complete-backend evidence package is required");

const parsedBackend = await parseBackend(backend.filePath);

if (dryRun) {
  const report = await syncMedia({ dryRun: true, parsedBackend });
  process.stdout.write(`${JSON.stringify({ mode: "dry-run", ...report }, null, 2)}\n`);
} else {
  const { db, pool } = await import("../src/db/client");
  try {
    const report = await syncMedia({
      dryRun: false,
      parsedBackend,
      sourceZipPath: backend.filePath,
      database: db,
      r2Env: process.env,
    });
    process.stdout.write(`${JSON.stringify({ mode: "commit", ...report }, null, 2)}\n`);
  } finally {
    await pool.end();
  }
}
