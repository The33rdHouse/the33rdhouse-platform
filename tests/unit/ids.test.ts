import { describe, expect, it } from "vitest";
import { gateId, pathId, realmId } from "../../src/canon/ids";

describe("canonical structural IDs", () => {
  it("formats Gate IDs deterministically", () => {
    expect(gateId(1)).toBe("gate-01");
    expect(gateId(12)).toBe("gate-12");
  });

  it("formats Path IDs deterministically", () => {
    expect(pathId(1)).toBe("path-01");
    expect(pathId(12)).toBe("path-12");
  });

  it("formats Realm IDs deterministically", () => {
    expect(realmId(1)).toBe("realm-001");
    expect(realmId(144)).toBe("realm-144");
  });

  it("rejects out-of-range and non-integer ordinals", () => {
    expect(() => gateId(0)).toThrow("Gate ordinal must be between 1 and 12");
    expect(() => pathId(13)).toThrow("Path ordinal must be between 1 and 12");
    expect(() => realmId(145)).toThrow("Realm number must be between 1 and 144");
    expect(() => realmId(1.5)).toThrow("Realm number must be an integer");
  });
});
