import { describe, expect, it } from "vitest";
import { assertSafeZipEntryPath } from "../../src/import/parsers/zip";

describe("assertSafeZipEntryPath", () => {
  it.each([
    "../evil.json",
    "safe/../evil.json",
    "/absolute.json",
    "C:\\evil.json",
    "\\\\server\\share\\evil.json",
    "safe\0evil.json",
  ])("rejects unsafe ZIP path %j", (path) => {
    expect(() => assertSafeZipEntryPath(path)).toThrow("Unsafe ZIP entry path");
  });

  it.each([
    "deity-atlas-data/realms_data.json",
    "the-33rd-house/lib/data/meditation-realms.ts",
    "assets/audio/meditations/realm_000_foundation.mp3",
  ])("accepts safe relative ZIP path %j", (path) => {
    expect(() => assertSafeZipEntryPath(path)).not.toThrow();
  });
});
