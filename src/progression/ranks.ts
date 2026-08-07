import { z } from "zod";

export const PROGRESS_METRICS = [
  "discoveries",
  "crossTraditionConnections",
  "completedPaths",
  "traditionsIntegrated",
  "connections",
  "masteredGates",
  "completedRealms",
] as const;

export type ProgressMetric = (typeof PROGRESS_METRICS)[number];
export type ProgressMetrics = Record<ProgressMetric, number>;

export type RankRuleRow = {
  id: string;
  ordinal: number;
  name: string;
  unlockRule: string;
};

const criterionSchema = z.object({
  metric: z.enum(PROGRESS_METRICS),
  gte: z.number().int().nonnegative(),
});
const unlockRuleSchema = z.object({ all: z.array(criterionSchema) });

export type UnlockRule = z.infer<typeof unlockRuleSchema>;

export function parseUnlockRule(value: string): UnlockRule {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch (error) {
    throw new Error("Rank unlock_rule must be valid JSON", { cause: error });
  }
  return unlockRuleSchema.parse(parsed);
}

export function ruleSatisfied(progress: ProgressMetrics, rule: UnlockRule): boolean {
  return rule.all.every((criterion) => progress[criterion.metric] >= criterion.gte);
}

export function calculateRank(progress: ProgressMetrics, rankRules: readonly RankRuleRow[]): RankRuleRow {
  if (rankRules.length === 0) throw new Error("At least one canonical rank rule is required");
  const ordered = [...rankRules].sort((left, right) => left.ordinal - right.ordinal);
  const ordinals = new Set<number>();
  let current: RankRuleRow | undefined;

  for (const rank of ordered) {
    if (!Number.isInteger(rank.ordinal) || rank.ordinal < 1) throw new Error("Rank ordinal must be a positive integer");
    if (ordinals.has(rank.ordinal)) throw new Error(`Duplicate rank ordinal: ${rank.ordinal}`);
    ordinals.add(rank.ordinal);

    const rule = parseUnlockRule(rank.unlockRule);
    if (!ruleSatisfied(progress, rule)) break;
    current = rank;
  }

  if (!current) throw new Error("The first canonical rank rule must be satisfiable for a new user");
  return current;
}

const ESCAPE_MATRIX_RULES: Readonly<Record<number, UnlockRule>> = {
  1: { all: [] },
  2: { all: [{ metric: "discoveries", gte: 12 }] },
  3: { all: [{ metric: "crossTraditionConnections", gte: 3 }] },
  4: { all: [{ metric: "completedPaths", gte: 1 }] },
  5: { all: [{ metric: "traditionsIntegrated", gte: 33 }] },
  6: { all: [{ metric: "completedPaths", gte: 12 }] },
  7: { all: [{ metric: "connections", gte: 144 }] },
  8: { all: [{ metric: "masteredGates", gte: 12 }] },
};

export function rankRuleFromEscapeMatrix(input: {
  id: string | number;
  name: string;
}): RankRuleRow {
  const ordinal = typeof input.id === "number" ? input.id : Number(input.id);
  if (!Number.isInteger(ordinal) || !ESCAPE_MATRIX_RULES[ordinal]) {
    throw new Error(`Unsupported Escape Matrix rank ordinal: ${String(input.id)}`);
  }
  return {
    id: `rank-${String(ordinal).padStart(2, "0")}`,
    ordinal,
    name: input.name.trim().normalize("NFC"),
    unlockRule: JSON.stringify(ESCAPE_MATRIX_RULES[ordinal]),
  };
}
