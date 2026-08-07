import { describe, expect, it } from "vitest";
import { CANON_STATUSES, MEDIA_AVAILABILITY, MAPPING_TYPES } from "../../src/db/schema";

describe("canonical schema enums", () => {
  it("locks canon lifecycle values", () => {
    expect(CANON_STATUSES).toEqual([
      "DRAFT",
      "UNDER_REVIEW",
      "APPROVED",
      "REJECTED",
      "ARCHIVED",
    ]);
  });

  it("locks media availability values", () => {
    expect(MEDIA_AVAILABILITY).toEqual(["AVAILABLE", "PLANNED", "MISSING", "ARCHIVED"]);
  });

  it("locks mapping claim types", () => {
    expect(MAPPING_TYPES).toEqual([
      "EQUIVALENCE",
      "ANALOGY",
      "FUNCTIONAL_SIMILARITY",
      "SYMBOLIC_RESONANCE",
    ]);
  });
});
