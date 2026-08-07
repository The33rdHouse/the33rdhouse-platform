import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { basename, join } from "node:path";
import * as unzipper from "unzipper";
import sourceManifest from "../../source-evidence/SOURCE_MANIFEST.json" with { type: "json" };

export type EvidenceExpectation = {
  id?: string;
  fileName: string;
  bytes: number;
  sha256: string;
};

export type VerifiedEvidence = {
  id?: string;
  fileName: string;
  filePath: string;
  bytes: number;
  sha256: string;
  zipEntries: string[];
};

async function sha256File(filePath: string): Promise<string> {
  return await new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const input = createReadStream(filePath);

    input.on("error", reject);
    input.on("data", (chunk) => hash.update(chunk));
    input.on("end", () => resolve(hash.digest("hex")));
  });
}

async function listZipEntries(filePath: string): Promise<string[]> {
  try {
    const directory = await unzipper.Open.file(filePath);
    return directory.files.map((entry) => entry.path);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Unreadable ZIP ${basename(filePath)}: ${message}`, { cause: error });
  }
}

export async function verifyEvidenceFile(
  filePath: string,
  expected: EvidenceExpectation,
): Promise<VerifiedEvidence> {
  if (basename(filePath) !== expected.fileName) {
    throw new Error(`Filename mismatch: expected ${expected.fileName}, got ${basename(filePath)}`);
  }

  const fileStat = await stat(filePath);
  if (!fileStat.isFile()) {
    throw new Error(`Evidence path is not a file: ${expected.fileName}`);
  }
  if (fileStat.size !== expected.bytes) {
    throw new Error(
      `Byte-size mismatch for ${expected.fileName}: expected ${expected.bytes}, got ${fileStat.size}`,
    );
  }

  const actualSha256 = await sha256File(filePath);
  if (actualSha256.toLowerCase() !== expected.sha256.toLowerCase()) {
    throw new Error(
      `SHA-256 mismatch for ${expected.fileName}: expected ${expected.sha256}, got ${actualSha256}`,
    );
  }

  const zipEntries = await listZipEntries(filePath);

  return {
    id: expected.id,
    fileName: expected.fileName,
    filePath,
    bytes: fileStat.size,
    sha256: actualSha256,
    zipEntries,
  };
}

export async function inventoryEvidenceDirectory(dir: string): Promise<VerifiedEvidence[]> {
  const verified: VerifiedEvidence[] = [];

  for (const source of sourceManifest.sources) {
    verified.push(await verifyEvidenceFile(join(dir, source.fileName), source));
  }

  return verified;
}
