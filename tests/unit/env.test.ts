import { describe, expect, it } from "vitest";
import { parseEnv } from "../../src/config/env";

describe("parseEnv", () => {
  it("requires a PostgreSQL DATABASE_URL", () => {
    expect(() => parseEnv({ DATABASE_URL: "mysql://localhost/db" })).toThrow(
      "DATABASE_URL must use postgres:// or postgresql://",
    );
  });

  it("accepts the Phase 1 minimum environment", () => {
    const result = parseEnv({
      DATABASE_URL: "postgresql://user:pass@localhost:5432/the33rdhouse",
      SOURCE_EVIDENCE_DIR: "/tmp/source-evidence",
    });
    expect(result.PORT).toBe(3000);
  });
});
