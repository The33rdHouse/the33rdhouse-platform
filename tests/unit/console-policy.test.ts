import { describe, it, expect } from "vitest";
import {
  intakeSchema,
  sessionDigest,
  validSessionToken,
  sameOrigin,
  readPreferences,
  TERMS_VERSION,
} from "../../src/console/policy";
describe("console trust boundaries", () => {
  it("rejects malformed tokens and never stores raw session tokens", () => {
    expect(validSessionToken("admin")).toBe(false);
    const token = "a".repeat(64);
    expect(validSessionToken(token)).toBe(true);
    expect(sessionDigest(token)).not.toContain(token);
    expect(sessionDigest(token)).toHaveLength(64);
  });
  it("rejects missing and foreign mutation origins", () => {
    expect(sameOrigin(undefined, "https://console.example")).toBe(false);
    expect(sameOrigin("https://evil.example", "https://console.example")).toBe(
      false,
    );
    expect(
      sameOrigin("https://console.example", "https://console.example"),
    ).toBe(true);
  });
  it("requires versioned acceptance and rejects supplied authority fields", () => {
    const input = {
      name: "Daniel",
      email: "d@example.com",
      requestedRole: "Keeper",
      accepted: true,
      termsVersion: TERMS_VERSION,
    };
    expect(intakeSchema.safeParse(input).success).toBe(true);
    for (const bad of [
      { ...input, accepted: false },
      { ...input, termsVersion: "old" },
      { ...input, email: "bad" },
      { ...input, name: " " },
      { ...input, weight: 999 },
    ])
      expect(intakeSchema.safeParse(bad).success).toBe(false);
  });
  it("accepts only known UI preferences, never stakeholder authority", () => {
    expect(readPreferences("{broken")).toEqual({ tab: "overview" });
    expect(readPreferences('{"tab":"ledger","weight":999}')).toEqual({
      tab: "overview",
    });
    expect(readPreferences('{"tab":"registry"}')).toEqual({ tab: "registry" });
  });
});
