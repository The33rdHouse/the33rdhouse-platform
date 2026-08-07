import { describe, expect, it } from "vitest";
import matchingFixture from "../fixtures/realm-matching.json";
import conflictFixture from "../fixtures/realm-conflict.json";
import {
  reconcileRealmVariants,
  type RealmSourceVariant,
} from "../../src/canon/realm-reconciliation";

describe("reconcileRealmVariants", () => {
  it("auto-approves structurally matching variants while preserving raw source values", () => {
    const variants = matchingFixture as RealmSourceVariant[];
    const result = reconcileRealmVariants(variants);

    expect(result.realmId).toBe("realm-027");
    expect(result.status).toBe("APPROVED");
    expect(result.conflicts).toEqual([]);
    expect(result.canonical).toMatchObject({
      realmNumber: 27,
      gate: 3,
      name: "Realm of Stillness",
    });
    expect(result.variants[1]?.name).toBe("  Realm of Stillness  ");
  });

  it("surfaces canon-significant conflicts without choosing a winner", () => {
    const variants = conflictFixture as RealmSourceVariant[];
    const result = reconcileRealmVariants(variants);

    expect(result.realmId).toBe("realm-027");
    expect(result.status).toBe("UNDER_REVIEW");
    expect(result.conflicts).toEqual(expect.arrayContaining(["name", "description"]));
    expect(result.canonical).toBeNull();
    expect(result.variants).toHaveLength(2);
  });

  it("compares Unicode in NFC form but leaves raw variants unchanged", () => {
    const composed = "Café";
    const decomposed = "Cafe\u0301";
    const variants: RealmSourceVariant[] = [
      { sourceId: "a", realmNumber: 1, gate: 1, name: composed },
      { sourceId: "b", realmNumber: 1, gate: 1, name: decomposed },
    ];

    const result = reconcileRealmVariants(variants);
    expect(result.status).toBe("APPROVED");
    expect(result.variants[1]?.name).toBe(decomposed);
  });

  it("rejects variants with different Realm identities", () => {
    expect(() =>
      reconcileRealmVariants([
        { sourceId: "a", realmNumber: 1, gate: 1, name: "A" },
        { sourceId: "b", realmNumber: 2, gate: 1, name: "A" },
      ]),
    ).toThrow("Realm variants must share one realmNumber");
  });
});
