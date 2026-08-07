import { env } from "../src/config/env";
import { inventoryEvidenceDirectory } from "../src/import/evidence";

const verified = await inventoryEvidenceDirectory(env.SOURCE_EVIDENCE_DIR);

const summary = {
  status: "verified",
  sourceCount: verified.length,
  sources: verified.map((source) => ({
    id: source.id,
    fileName: source.fileName,
    bytes: source.bytes,
    sha256: source.sha256,
    zipEntryCount: source.zipEntries.length,
    zipEntries: source.zipEntries,
  })),
};

process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
