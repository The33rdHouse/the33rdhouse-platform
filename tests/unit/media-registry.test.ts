import { describe, expect, it } from "vitest";
import { buildRealmMediaRegistry } from "../../src/media/registry";
import { syncMedia } from "../../src/media/sync";
import type { ParsedSourcePackage } from "../../src/import/types";

function backendFixture(count = 55): ParsedSourcePackage {
  return {
    sourceId: "complete-backend",
    records: [],
    warnings: [],
    media: Array.from({ length: count }, (_, realmIndex) => ({
      sourcePath: `the-33rd-house/assets/audio/meditations/realm_${String(realmIndex).padStart(3, "0")}_fixture.mp3`,
      fileName: `realm_${String(realmIndex).padStart(3, "0")}_fixture.mp3`,
      realmIndex,
      mimeType: "audio/mpeg",
      sha256: String(realmIndex).padStart(64, "0"),
    })),
  };
}

describe("buildRealmMediaRegistry", () => {
  it("represents approved backend coverage as 55 AVAILABLE and 89 MISSING", () => {
    const registry = buildRealmMediaRegistry(backendFixture());
    expect(registry.filter((item) => item.availability === "AVAILABLE")).toHaveLength(55);
    expect(registry.filter((item) => item.availability === "MISSING")).toHaveLength(89);
    expect(registry).toHaveLength(144);
    expect(registry[0]?.realmId).toBe("realm-001");
    expect(registry[54]?.realmId).toBe("realm-055");
  });

  it("rejects source media indexes outside 0-143", () => {
    const parsed = backendFixture(1);
    parsed.media[0]!.realmIndex = 144;
    expect(() => buildRealmMediaRegistry(parsed)).toThrow("Realm media index must be between 0 and 143");
  });

  it("rejects duplicate media files for the same Realm index", () => {
    const parsed = backendFixture(1);
    parsed.media.push({ ...parsed.media[0]! });
    expect(() => buildRealmMediaRegistry(parsed)).toThrow("Duplicate Realm media index");
  });

  it("runs dry without R2 secrets or database access", async () => {
    const report = await syncMedia({ dryRun: true, parsedBackend: backendFixture() });
    expect(report).toMatchObject({ available: 55, missing: 89, uploaded: 0, persisted: 0 });
  });
});
