import { it, expect } from "vitest";
import { mkdtemp, writeFile, symlink, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { readExhibit } from "../../src/console/vault";
it("only serves exact allowlisted bytes and rejects tampering and path escape", async () => {
  const root = await mkdtemp(join(tmpdir(), "harmga-vault-"));
  const outside = await mkdtemp(join(tmpdir(), "harmga-outside-"));
  try {
    await writeFile(join(root, "sample.txt"), "verified");
    const entry = {
      id: "L-01",
      title: "Sample",
      tier: "E1",
      file: "sample.txt",
      sha256: createHash("sha256").update("verified").digest("hex"),
    };
    expect(await readExhibit("../sample.txt", root, [entry])).toBeNull();
    expect((await readExhibit("L-01", root, [entry]))?.data.toString()).toBe(
      "verified",
    );
    await writeFile(join(root, "sample.txt"), "modified");
    await expect(readExhibit("L-01", root, [entry])).rejects.toThrow(
      "integrity",
    );
    await writeFile(join(outside, "secret.txt"), "verified");
    await symlink(join(outside, "secret.txt"), join(root, "escape.txt"));
    await expect(
      readExhibit("L-01", root, [{ ...entry, file: "escape.txt" }]),
    ).rejects.toThrow("path");
  } finally {
    await rm(root, { recursive: true, force: true });
    await rm(outside, { recursive: true, force: true });
  }
});
