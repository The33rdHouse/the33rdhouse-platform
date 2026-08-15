import { describe, expect, it } from "vitest";
import { parseStaticExportedArray } from "../../src/import/parsers/static-ts";

describe("parseStaticExportedArray", () => {
  it("rejects executable expressions instead of evaluating or skipping them", () => {
    const source = "export const DATA = [{ id: dangerous(), name: 'x' }];";
    expect(() => parseStaticExportedArray(source, "DATA")).toThrow(
      "Unsupported static TypeScript expression",
    );
  });

  it("accepts nested literal arrays and objects", () => {
    const source = "export const DATA = [{ id: 1, name: 'x', flags: [true, false], nested: { score: -2 } }];";
    expect(parseStaticExportedArray(source, "DATA")).toEqual([
      { id: 1, name: "x", flags: [true, false], nested: { score: -2 } },
    ]);
  });
});
