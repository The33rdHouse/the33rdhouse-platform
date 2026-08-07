import { describe, expect, it } from "vitest";
import { parseEscapeMatrix } from "../../src/import/parsers/escape-matrix";
import { createSourceZipFixture } from "../helpers/source-zip-fixtures";

describe("parseEscapeMatrix", () => {
  it("emits typed staging records from the aggregate source JSON", async () => {
    const fixture = await createSourceZipFixture("escape-matrix-mini.zip");
    try {
      const parsed = await parseEscapeMatrix(fixture.path);
      expect(parsed.records.filter((record) => record.kind === "gate")).toHaveLength(2);
      expect(parsed.records.filter((record) => record.kind === "tradition")).toHaveLength(3);
      expect(parsed.records.filter((record) => record.kind === "path")).toHaveLength(2);
      expect(parsed.records.filter((record) => record.kind === "rank")).toHaveLength(1);
      expect(parsed.records.filter((record) => record.kind === "law")).toHaveLength(1);
      expect(parsed.records.filter((record) => record.kind === "trap")).toHaveLength(1);
      expect(parsed.records.filter((record) => record.kind === "achievement")).toHaveLength(1);
    } finally {
      await fixture.cleanup();
    }
  });
});
