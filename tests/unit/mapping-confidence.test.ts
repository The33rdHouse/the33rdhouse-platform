import { describe, expect, it } from "vitest";
import claimsFixture from "../fixtures/claims-confidence.json";
import { parseMappingClaim } from "../../src/canon/knowledge";

describe("mapping confidence fixture", () => {
  it("accepts all approved confidence grades A through D", () => {
    expect(claimsFixture.validByGrade.map((claim) => parseMappingClaim(claim).confidence)).toEqual([
      "A",
      "B",
      "C",
      "D",
    ]);
  });
});
