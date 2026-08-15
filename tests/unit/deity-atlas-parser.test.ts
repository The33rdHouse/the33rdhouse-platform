import { describe, expect, it } from "vitest";
import { parseDeityAtlas } from "../../src/import/parsers/deity-atlas";
import { createSourceZipFixture } from "../helpers/source-zip-fixtures";

describe("parseDeityAtlas", () => {
  it("keeps Realm and meditation variants distinct in staging", async () => {
    const fixture = await createSourceZipFixture("deity-atlas-mini.zip");
    try {
      const parsed = await parseDeityAtlas(fixture.path);
      expect(parsed.records.filter((record) => record.kind === "deity")).toHaveLength(2);
      expect(parsed.records.filter((record) => record.kind === "realm_variant")).toHaveLength(2);
      expect(parsed.records.filter((record) => record.kind === "meditation_realm_variant")).toHaveLength(2);
      expect(parsed.records.filter((record) => record.kind === "weekly_script")).toHaveLength(1);
      expect(parsed.records.filter((record) => record.kind === "research_library")).toHaveLength(1);
      expect(parsed.records.filter((record) => record.kind === "era")).toHaveLength(1);
      expect(parsed.records.filter((record) => record.kind === "cosmology_metadata")).toHaveLength(1);
      expect(parsed.records.filter((record) => record.kind === "platform_metadata")).toHaveLength(1);
    } finally {
      await fixture.cleanup();
    }
  });
});
