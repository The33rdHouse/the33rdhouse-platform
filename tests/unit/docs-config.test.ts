import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function read(path: string): string {
  return readFileSync(path, "utf8");
}

describe("canonical runtime documentation", () => {
  it("names the approved Phase 1 runtime without claiming superseded infrastructure", () => {
    const deployment = read("docs/operations/DEPLOYMENT.md");

    expect(deployment).toContain("Node.js 24.x");
    expect(deployment).toContain("PostgreSQL");
    expect(deployment).toContain("Cloudflare R2");
    expect(deployment).not.toContain("MySQL");
    expect(deployment).not.toMatch(/Stripe is implemented/i);
    expect(deployment).toMatch(/Stripe and payment processing are outside Phase 1/i);
  });

  it("locks the import runbook to dry-run before commit mode", () => {
    const runbook = read("docs/operations/CANONICAL_IMPORT_RUNBOOK.md");

    const commands = [
      "pnpm sources:inventory",
      "pnpm sources:import -- --dry-run",
      "pnpm sources:import -- --commit",
      "pnpm media:sync -- --dry-run",
      "pnpm media:sync -- --commit",
    ];

    let previousIndex = -1;
    for (const command of commands) {
      const index = runbook.indexOf(command);
      expect(index).toBeGreaterThan(previousIndex);
      previousIndex = index;
    }

    expect(runbook).toMatch(/commit mode.*forbidden/i);
    expect(runbook).toMatch(/SHA-256 mismatch/i);
  });

  it("documents non-destructive Realm conflict governance", () => {
    const conflictReview = read("docs/operations/REALM_CONFLICT_REVIEW.md");

    expect(conflictReview).toContain("UNDER_REVIEW");
    expect(conflictReview).toMatch(/Never delete the losing source representation/i);
    expect(conflictReview).toMatch(/new canon version/i);
    expect(conflictReview).toMatch(/audit log/i);
  });

  it("keeps the example environment aligned with PostgreSQL and R2", () => {
    const exampleEnv = read(".env.example");

    expect(exampleEnv).toMatch(/^DATABASE_URL=postgresql:\/\//m);
    expect(exampleEnv).toContain("R2_ACCOUNT_ID=");
    expect(exampleEnv).toContain("R2_ACCESS_KEY_ID=");
    expect(exampleEnv).toContain("R2_SECRET_ACCESS_KEY=");
    expect(exampleEnv).toContain("R2_BUCKET=");
    expect(exampleEnv).not.toMatch(/STRIPE_/);
  });
});
