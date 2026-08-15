import { describe, expect, it } from "vitest";
import rankRules from "../fixtures/rank-rules.json";
import { calculateRank, type ProgressMetrics } from "../../src/progression/ranks";

const zero: ProgressMetrics = {
  discoveries: 0,
  crossTraditionConnections: 0,
  completedPaths: 0,
  traditionsIntegrated: 0,
  connections: 0,
  masteredGates: 0,
  completedRealms: 0,
};

describe("calculateRank", () => {
  it.each([
    [zero, "Seeker"],
    [{ ...zero, discoveries: 12 }, "Novice"],
    [{ ...zero, discoveries: 12, crossTraditionConnections: 3 }, "Initiate"],
    [{ ...zero, discoveries: 12, crossTraditionConnections: 3, completedPaths: 1 }, "Adept"],
    [{ ...zero, discoveries: 12, crossTraditionConnections: 3, completedPaths: 1, traditionsIntegrated: 33 }, "Keeper"],
    [{ ...zero, discoveries: 12, crossTraditionConnections: 3, completedPaths: 12, traditionsIntegrated: 33 }, "Guardian"],
    [{ ...zero, discoveries: 12, crossTraditionConnections: 3, completedPaths: 12, traditionsIntegrated: 33, connections: 144 }, "Sage"],
    [{ ...zero, discoveries: 12, crossTraditionConnections: 3, completedPaths: 12, traditionsIntegrated: 33, connections: 144, masteredGates: 12 }, "Elder"],
  ] as const)("selects the highest sequentially satisfied persisted rank", (progress, expected) => {
    expect(calculateRank(progress, rankRules).name).toBe(expected);
  });

  it("does not skip an unmet lower rank even if a later metric is satisfied", () => {
    expect(calculateRank({ ...zero, traditionsIntegrated: 33 }, rankRules).name).toBe("Seeker");
  });
});
