import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { verifyEvidenceFile } from "../../src/import/evidence";

const temporaryDirectories: string[] = [];

async function fixturePath(name: string, contents: Buffer): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), "the33rdhouse-evidence-"));
  temporaryDirectories.push(directory);
  const filePath = join(directory, name);
  await writeFile(filePath, contents);
  return filePath;
}

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe("verifyEvidenceFile", () => {
  it("rejects a source package whose bytes do not match the approved hash", async () => {
    const filePath = await fixturePath("tampered.zip", Buffer.from("bad"));

    await expect(
      verifyEvidenceFile(filePath, {
        fileName: "tampered.zip",
        bytes: 3,
        sha256: "00".repeat(32),
      }),
    ).rejects.toThrow("SHA-256 mismatch");
  });
});
