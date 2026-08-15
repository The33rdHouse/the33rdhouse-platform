import { describe, expect, it } from "vitest";
import { parseBackend } from "../../src/import/parsers/backend";
import { createSourceZipFixture } from "../helpers/source-zip-fixtures";

describe("parseBackend", () => {
  it("treats TypeScript as static source and registers media without executing code", async () => {
    const fixture = await createSourceZipFixture("backend-mini.zip");
    try {
      const parsed = await parseBackend(fixture.path);
      expect(parsed.records.filter((record) => record.kind === "file_inventory").length).toBeGreaterThan(0);
      expect(parsed.records.filter((record) => record.kind === "backend_realm_variant")).toHaveLength(1);
      expect(parsed.records.filter((record) => record.kind === "backend_era")).toHaveLength(1);
      expect(parsed.records.filter((record) => record.kind === "backend_book")).toHaveLength(1);
      expect(parsed.media).toHaveLength(1);
      expect(parsed.media[0]?.realmIndex).toBe(0);
    } finally {
      await fixture.cleanup();
    }
  });
});
