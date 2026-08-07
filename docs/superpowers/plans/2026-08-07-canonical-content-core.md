# Canonical Content Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Phase 1 Canonical Content Core that inventories the three approved source packages, preserves provenance, reconciles conflicting Realm variants, stores approved canonical knowledge in PostgreSQL, exposes bounded tRPC read/governance APIs, registers meditation media explicitly, and persists user progression.

**Architecture:** Build a clean TypeScript service in `The33rdHouseMaster/the33rdhouse-platform` instead of copying the incomplete uploaded backend scaffold. PostgreSQL is the canonical database; Cloudflare R2 is the selected media object-store target through an S3-compatible adapter. Raw ZIP archives remain immutable source evidence and are never committed to Git; the repository stores their SHA-256 manifest and import code. All raw source representations land in staging/provenance records before canonical promotion.

**Tech Stack:** Node.js 24.x, TypeScript 5.x, pnpm, Express, tRPC, Zod, SuperJSON, PostgreSQL 16+, Drizzle ORM/Drizzle Kit, `pg`, `unzipper`, AWS SDK S3 client configured for Cloudflare R2, Vitest, ESLint, GitHub Actions.

## Global Constraints

- Approach B — Canonical Knowledge Platform is the governing architecture.
- One canon → one backend → many experiences.
- Preserve all three source packages unchanged; do not commit raw ZIP bytes to Git.
- Never silently overwrite conflicting Realm variants.
- Canon lifecycle is `DRAFT → UNDER_REVIEW → APPROVED → REJECTED / ARCHIVED`.
- Published read APIs return only `APPROVED` canonical versions unless an authenticated admin preview path explicitly requests otherwise.
- Media availability is explicit: `AVAILABLE`, `PLANNED`, `MISSING`, or `ARCHIVED`.
- Cross-tradition mappings use `EQUIVALENCE`, `ANALOGY`, `FUNCTIONAL_SIMILARITY`, or `SYMBOLIC_RESONANCE` plus confidence `A`, `B`, `C`, or `D`.
- No secrets committed to Git.
- Administrative canon changes must record actor, timestamp, action, and version.
- Import jobs fail closed on malformed archives, schema validation failures, hash mismatches, duplicate structural identifiers, or referential-integrity errors.
- Payment/Stripe implementation, visual redesign, social features, and speculative AI agents are outside Phase 1.

## Approved source baseline

The implementation must recognize these exact immutable source packages:

| Source package | Size (bytes) | SHA-256 |
| --- | ---: | --- |
| `the-33rd-house-complete-backend.zip` | 780332 | `807118cb83c9c2a3d17208dc2359500ebd8b9b9535b59063887a097ba5103859` |
| `escape-matrix-data (1).zip` | 65766 | `723f4939fee408c45662bfcb02fda5e453c4241b0d1c44533bb89980f490bd5e` |
| `deity-atlas-data.zip` | 203307 | `63de0efb96498508d809c12302cead3ba6e0eb4f6adeab68a22e0ba6f558aa1d` |

Known source facts to assert in migration fixtures:

- Deity Atlas contains 447 deity records.
- Deity Atlas `realms_data.json` contains 144 Realm records.
- Deity Atlas `meditation_data.json` contains 144 Realm records and 48 weekly teaching scripts.
- Escape Matrix contains 66 traditions, 12 Gates, 12 Paths, 8 ranks, 12 laws, 4 Matrix Traps, and 5 achievements.
- The backend archive contains 55 Realm MP3 files, covering Realm indexes 0–54 only.
- The backend implementation references MySQL Drizzle and missing source dependencies (`drizzle/schema`, `shared/const`); it is evidence/input, not the Phase 1 runtime scaffold.

## Planned repository structure

```text
.
├── .env.example
├── .gitignore
├── .github/workflows/ci.yml
├── drizzle.config.ts
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── vitest.config.ts
├── source-evidence/
│   ├── README.md
│   └── SOURCE_MANIFEST.json
├── scripts/
│   ├── inventory-sources.ts
│   ├── import-sources.ts
│   └── sync-media.ts
├── src/
│   ├── app.ts
│   ├── index.ts
│   ├── config/env.ts
│   ├── db/
│   │   ├── client.ts
│   │   ├── migrate.ts
│   │   └── schema/
│   │       ├── canon.ts
│   │       ├── identity.ts
│   │       ├── knowledge.ts
│   │       ├── structure.ts
│   │       ├── curriculum.ts
│   │       ├── progression.ts
│   │       └── index.ts
│   ├── import/
│   │   ├── evidence.ts
│   │   ├── pipeline.ts
│   │   ├── types.ts
│   │   ├── schemas/
│   │   │   ├── deity-atlas.ts
│   │   │   ├── escape-matrix.ts
│   │   │   └── backend.ts
│   │   └── parsers/
│   │       ├── deity-atlas.ts
│   │       ├── escape-matrix.ts
│   │       ├── backend.ts
│   │       └── static-ts.ts
│   ├── canon/
│   │   ├── ids.ts
│   │   ├── realm-reconciliation.ts
│   │   ├── promotion.ts
│   │   └── governance.ts
│   ├── media/
│   │   ├── registry.ts
│   │   └── r2.ts
│   ├── progression/
│   │   ├── ranks.ts
│   │   └── service.ts
│   └── api/
│       ├── context.ts
│       ├── trpc.ts
│       ├── router.ts
│       └── routers/
│           ├── atlas.ts
│           ├── traditions.ts
│           ├── gates.ts
│           ├── realms.ts
│           ├── paths.ts
│           ├── progress.ts
│           ├── achievements.ts
│           ├── correspondences.ts
│           ├── research.ts
│           ├── claims.ts
│           └── admin.ts
└── tests/
    ├── fixtures/
    │   ├── realm-matching.json
    │   ├── realm-conflict.json
    │   ├── duplicate-deity-alias.json
    │   ├── conflicting-tradition.json
    │   └── claims-confidence.json
    ├── unit/
    └── integration/
```

---

### Task 1: Bootstrap the canonical service and lock infrastructure decisions

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `drizzle.config.ts`
- Create: `.env.example`
- Create: `.gitignore`
- Create: `src/config/env.ts`
- Create: `src/app.ts`
- Create: `src/index.ts`
- Create: `tests/unit/env.test.ts`
- Modify: `README.md`

**Interfaces:**
- Produces: `env` object with `DATABASE_URL`, `PORT`, optional `R2_*` values, and `SOURCE_EVIDENCE_DIR`.
- Produces: `createApp(): Express` for later API integration.
- Database choice: PostgreSQL 16+.
- Media-store choice: Cloudflare R2 through S3-compatible AWS SDK configuration.

- [ ] **Step 1: Write the failing environment test**

```ts
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
```

- [ ] **Step 2: Run the test and verify it fails because `parseEnv` does not exist**

Run: `pnpm vitest run tests/unit/env.test.ts`

Expected: FAIL with module/function-not-found error.

- [ ] **Step 3: Create the Node/TypeScript package and environment parser**

`package.json` scripts must include:

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc -p tsconfig.json",
    "check": "tsc --noEmit",
    "test": "vitest run",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "tsx src/db/migrate.ts",
    "sources:inventory": "tsx scripts/inventory-sources.ts",
    "sources:import": "tsx scripts/import-sources.ts",
    "media:sync": "tsx scripts/sync-media.ts"
  }
}
```

`src/config/env.ts` must validate with Zod and reject non-PostgreSQL URLs before startup.

- [ ] **Step 4: Add `.gitignore` source-evidence and secret rules**

At minimum:

```gitignore
node_modules/
dist/
.env
.env.*
!.env.example
source-evidence/*.zip
source-evidence/extracted/
coverage/
```

- [ ] **Step 5: Run bootstrap verification**

Run:

```bash
pnpm install
pnpm check
pnpm vitest run tests/unit/env.test.ts
```

Expected: all commands PASS.

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml tsconfig.json vitest.config.ts drizzle.config.ts .env.example .gitignore src tests README.md
git commit -m "build: bootstrap canonical content service"
```

---

### Task 2: Create the canonical PostgreSQL schema and first migration

**Files:**
- Create: `src/db/client.ts`
- Create: `src/db/migrate.ts`
- Create: `src/db/schema/canon.ts`
- Create: `src/db/schema/identity.ts`
- Create: `src/db/schema/knowledge.ts`
- Create: `src/db/schema/structure.ts`
- Create: `src/db/schema/curriculum.ts`
- Create: `src/db/schema/progression.ts`
- Create: `src/db/schema/index.ts`
- Create: `tests/unit/schema.test.ts`
- Generate: `drizzle/*`

**Interfaces:**
- Produces: Drizzle `db` client backed by `pg.Pool`.
- Produces stable structural IDs: `gate-01` through `gate-12`; `realm-001` through `realm-144`; `path-01` through `path-12`.
- Produces enums: canon level/status, mapping type/confidence, media availability.

- [ ] **Step 1: Write schema contract tests**

```ts
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
```

- [ ] **Step 2: Run test and verify failure**

Run: `pnpm vitest run tests/unit/schema.test.ts`

Expected: FAIL because schema exports do not exist.

- [ ] **Step 3: Implement schema domains**

Create tables for:

```text
identity: users, roles, user_roles, sessions
canon: canon_objects, canon_versions, canon_source_records, canon_pins, canon_reviews, audit_log
knowledge: deities, deity_aliases, traditions, concepts, eras, sources, citations, mapping_claims, mapping_claim_evidence
structure: gates, paths, realms, realm_source_variants, practices, glyphs, correspondences
curriculum: teachings, meditations, media_assets, realm_media, content_releases
progression: user_progress, user_gate_progress, user_realm_progress, discoveries, achievements, user_achievements, ranks, user_rank_history, bookmarks, journal_entries
```

`realm_source_variants` must preserve raw source name/description/Gate metadata plus `source_record_id`; canonical Realm rows must not delete source variants.

- [ ] **Step 4: Generate migration and inspect SQL**

Run:

```bash
pnpm db:generate
pnpm check
```

Expected: generated migration contains foreign keys from Realm variants to `realms` and `canon_source_records`, and unique constraints on `gates.ordinal`, `paths.ordinal`, and `realms.realm_number`.

- [ ] **Step 5: Run migration against a disposable PostgreSQL database**

Run:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/the33rdhouse_test pnpm db:migrate
```

Expected: exit code 0.

- [ ] **Step 6: Commit**

```bash
git add src/db drizzle tests/unit/schema.test.ts
git commit -m "feat: add canonical PostgreSQL schema"
```

---

### Task 3: Preserve and verify immutable source evidence

**Files:**
- Create: `source-evidence/README.md`
- Create: `source-evidence/SOURCE_MANIFEST.json`
- Create: `src/import/evidence.ts`
- Create: `scripts/inventory-sources.ts`
- Create: `tests/unit/evidence.test.ts`

**Interfaces:**
- Produces: `verifyEvidenceFile(filePath, expected): Promise<VerifiedEvidence>`.
- Produces: `inventoryEvidenceDirectory(dir): Promise<VerifiedEvidence[]>`.
- Consumes exact source filenames, byte sizes, and SHA-256 values from the approved source baseline.

- [ ] **Step 1: Commit the immutable manifest, not the ZIP bytes**

`SOURCE_MANIFEST.json` must contain exactly:

```json
{
  "version": 1,
  "sources": [
    {
      "id": "complete-backend",
      "fileName": "the-33rd-house-complete-backend.zip",
      "bytes": 780332,
      "sha256": "807118cb83c9c2a3d17208dc2359500ebd8b9b9535b59063887a097ba5103859"
    },
    {
      "id": "escape-matrix",
      "fileName": "escape-matrix-data (1).zip",
      "bytes": 65766,
      "sha256": "723f4939fee408c45662bfcb02fda5e453c4241b0d1c44533bb89980f490bd5e"
    },
    {
      "id": "deity-atlas",
      "fileName": "deity-atlas-data.zip",
      "bytes": 203307,
      "sha256": "63de0efb96498508d809c12302cead3ba6e0eb4f6adeab68a22e0ba6f558aa1d"
    }
  ]
}
```

- [ ] **Step 2: Write failing hash verification tests**

```ts
it("rejects a source package whose bytes do not match the approved hash", async () => {
  await expect(
    verifyEvidenceFile(fixturePath("tampered.zip"), {
      fileName: "tampered.zip",
      bytes: 3,
      sha256: "00".repeat(32),
    }),
  ).rejects.toThrow("SHA-256 mismatch");
});
```

- [ ] **Step 3: Implement streaming SHA-256 verification**

Use `createReadStream` + `crypto.createHash("sha256")`; never load the 780 KB+ ZIP contents into a string or mutate the files.

- [ ] **Step 4: Implement `sources:inventory`**

Command behavior:

```text
pnpm sources:inventory
  -> verify all three files exist under SOURCE_EVIDENCE_DIR
  -> verify exact bytes
  -> verify exact SHA-256
  -> list ZIP entries without extracting them
  -> print a JSON summary
  -> exit non-zero on any mismatch
```

- [ ] **Step 5: Verify with the three approved packages**

Expected summary includes `verified: 3`, with no changed source files.

- [ ] **Step 6: Commit**

```bash
git add source-evidence src/import/evidence.ts scripts/inventory-sources.ts tests/unit/evidence.test.ts
git commit -m "feat: verify immutable source evidence"
```

---

### Task 4: Parse all three source packages into typed staging records

**Files:**
- Create: `src/import/types.ts`
- Create: `src/import/schemas/deity-atlas.ts`
- Create: `src/import/schemas/escape-matrix.ts`
- Create: `src/import/schemas/backend.ts`
- Create: `src/import/parsers/deity-atlas.ts`
- Create: `src/import/parsers/escape-matrix.ts`
- Create: `src/import/parsers/backend.ts`
- Create: `src/import/parsers/static-ts.ts`
- Create: `tests/unit/deity-atlas-parser.test.ts`
- Create: `tests/unit/escape-matrix-parser.test.ts`
- Create: `tests/unit/backend-parser.test.ts`

**Interfaces:**
- Produces: `ParsedSourcePackage` with `sourceId`, `records`, `media`, and `warnings`.
- `parseDeityAtlas(zipPath)` must emit 447 deity records, 144 Realm variants from `realms_data.json`, 144 meditation Realm variants, 48 weekly scripts, 15 research-library records, and era/cosmology/platform metadata.
- `parseEscapeMatrix(zipPath)` must emit 66 traditions, 12 Gates, 12 Paths, 8 ranks, 12 laws, 4 traps, and 5 achievements.
- `parseBackend(zipPath)` must inventory server/app/data files, parse only static data structures, and register 55 meditation MP3 entries. It must never execute imported TypeScript.

- [ ] **Step 1: Write count-based parser tests using sanitized fixture ZIPs**

Example assertion:

```ts
const parsed = await parseEscapeMatrix(fixturePath("escape-matrix-mini.zip"));
expect(parsed.records.filter((r) => r.kind === "gate")).toHaveLength(2);
expect(parsed.records.filter((r) => r.kind === "tradition")).toHaveLength(3);
```

- [ ] **Step 2: Run parser tests and verify failure**

Run: `pnpm vitest run tests/unit/*parser.test.ts`

Expected: FAIL because parsers do not exist.

- [ ] **Step 3: Implement safe ZIP readers and Zod schemas**

Reject path traversal entries containing `..`, absolute paths, or NUL bytes. Parse JSON with Zod. Do not `eval`, `require`, dynamically import, or execute files from the archives.

- [ ] **Step 4: Implement safe static TypeScript extraction for backend Realm data**

Use the TypeScript compiler API to parse `lib/data/meditation-realms.ts`; accept only literal arrays/objects/strings/numbers/booleans. Reject functions, calls, computed property access, or executable expressions with `Unsupported static TypeScript expression`.

- [ ] **Step 5: Run parsers against the approved source packages**

Expected counts must match the Approved source baseline. Any mismatch is a migration gate and exits non-zero.

- [ ] **Step 6: Commit**

```bash
git add src/import tests/unit/*parser.test.ts
git commit -m "feat: parse canonical source packages safely"
```

---

### Task 5: Implement stable IDs and Realm conflict reconciliation

**Files:**
- Create: `src/canon/ids.ts`
- Create: `src/canon/realm-reconciliation.ts`
- Create: `tests/fixtures/realm-matching.json`
- Create: `tests/fixtures/realm-conflict.json`
- Create: `tests/unit/ids.test.ts`
- Create: `tests/unit/realm-reconciliation.test.ts`

**Interfaces:**
- Produces: `gateId(ordinal): "gate-01".."gate-12"`.
- Produces: `realmId(realmNumber): "realm-001".."realm-144"`.
- Produces: `pathId(ordinal): "path-01".."path-12"`.
- Produces: `reconcileRealmVariants(variants): RealmReconciliationResult`.

- [ ] **Step 1: Write stable-ID tests**

```ts
expect(gateId(1)).toBe("gate-01");
expect(realmId(1)).toBe("realm-001");
expect(realmId(144)).toBe("realm-144");
expect(() => realmId(145)).toThrow("Realm number must be between 1 and 144");
```

- [ ] **Step 2: Write conflict tests**

```ts
const result = reconcileRealmVariants([
  { sourceId: "deity-atlas-realms", realmNumber: 27, gate: 3, name: "Name A" },
  { sourceId: "deity-atlas-meditations", realmNumber: 27, gate: 3, name: "Name B" },
]);

expect(result.realmId).toBe("realm-027");
expect(result.status).toBe("UNDER_REVIEW");
expect(result.conflicts).toContain("name");
expect(result.variants).toHaveLength(2);
```

- [ ] **Step 3: Implement normalization without destructive merging**

Trim surrounding whitespace and normalize Unicode to NFC for comparison only. Preserve each original raw value unchanged in the source variant record.

- [ ] **Step 4: Define precedence behavior**

Only exact agreement promotes structural fields automatically. Any disagreement in Realm name, Gate, Gate name, or canon-significant description sets `UNDER_REVIEW`. Do not choose a winner automatically.

- [ ] **Step 5: Run reconciliation against all 144 source identities**

Expected: exactly 144 stable Realm IDs; no Realm number outside 1–144; conflicts surfaced as review records rather than overwritten values.

- [ ] **Step 6: Commit**

```bash
git add src/canon tests/fixtures/realm-* tests/unit/ids.test.ts tests/unit/realm-reconciliation.test.ts
git commit -m "feat: reconcile Realm source variants"
```

---

### Task 6: Build the staging-to-canon import pipeline with provenance and audit

**Files:**
- Create: `src/import/pipeline.ts`
- Create: `src/canon/promotion.ts`
- Create: `src/canon/governance.ts`
- Create: `scripts/import-sources.ts`
- Create: `tests/integration/import-pipeline.test.ts`
- Create: `tests/integration/canon-versioning.test.ts`

**Interfaces:**
- Produces: `importSources(db, parsedPackages, actor): Promise<ImportReport>`.
- Produces: `promoteCanonObject(db, input, actor): Promise<CanonVersion>`.
- Produces immutable `canon_source_records` plus append-only `canon_versions` and `audit_log` entries.

- [ ] **Step 1: Write an integration test proving source variants survive promotion**

```ts
const report = await importFixtureSet(db, "realm-conflict");
expect(report.conflicts).toBe(1);

const variants = await db.query.realmSourceVariants.findMany();
expect(variants).toHaveLength(2);

const realm = await db.query.realms.findFirst();
expect(realm?.canonStatus).toBe("UNDER_REVIEW");
```

- [ ] **Step 2: Write versioning/audit test**

Approve a Realm, then revise it. Assert version increases from 1 to 2 and two audit events remain queryable.

- [ ] **Step 3: Implement one database transaction per source package**

If a record in one package fails validation or referential integrity, roll back that package import. Do not leave partially promoted canonical rows.

- [ ] **Step 4: Implement explicit promotion rules**

Automatic promotion is limited to structurally unambiguous records. Conflicted Realm records remain `UNDER_REVIEW`. Admin approval creates a new canon version; it never edits a historical source record.

- [ ] **Step 5: Execute dry-run and commit modes**

Commands:

```bash
pnpm sources:import -- --dry-run
pnpm sources:import -- --commit
```

Dry-run must perform all parsing, validation, diffing, and reconciliation without database writes.

- [ ] **Step 6: Commit**

```bash
git add src/import/pipeline.ts src/canon scripts/import-sources.ts tests/integration
git commit -m "feat: add provenance-aware canon import pipeline"
```

---

### Task 7: Import Deity Atlas, Escape Matrix, research provenance, and mapping claims

**Files:**
- Create: `tests/fixtures/duplicate-deity-alias.json`
- Create: `tests/fixtures/conflicting-tradition.json`
- Create: `tests/fixtures/claims-confidence.json`
- Create: `tests/integration/knowledge-import.test.ts`
- Modify: `src/import/pipeline.ts`
- Modify: `src/canon/promotion.ts`

**Interfaces:**
- Consumes typed records from Task 4.
- Produces canonical Deities, aliases, Traditions, Eras, Sources, Citations, Correspondences, and Mapping Claims.

- [ ] **Step 1: Write alias de-duplication test**

Two deity aliases with identical normalized text under the same deity collapse to one alias row; raw source records remain separate.

- [ ] **Step 2: Write tradition conflict test**

Two records with the same stable tradition identity but different canon-significant display names must create a reviewable source conflict rather than silently renaming the canonical row.

- [ ] **Step 3: Write mapping-claim validation test**

```ts
expect(() => parseMappingClaim({ type: "SAME_THING", confidence: "A" })).toThrow();
expect(parseMappingClaim({ type: "ANALOGY", confidence: "C" })).toMatchObject({
  type: "ANALOGY",
  confidence: "C",
});
```

- [ ] **Step 4: Implement deterministic knowledge IDs**

Use canonical slugs plus a collision suffix derived from SHA-256 of the source natural key. Never use array index as the canonical identity for Deities or Traditions.

- [ ] **Step 5: Import the approved corpus in dry-run mode**

Expected minimum assertions:

```text
447 Deity Atlas source deity records observed
66 Escape Matrix tradition records observed
12 Gates observed
12 Paths observed
15 research-library source records observed
```

Any lower count fails the run.

- [ ] **Step 6: Commit**

```bash
git add src/import/pipeline.ts src/canon/promotion.ts tests/fixtures tests/integration/knowledge-import.test.ts
git commit -m "feat: import canonical knowledge graph records"
```

---

### Task 8: Register meditation media and select Cloudflare R2 without assuming full coverage

**Files:**
- Create: `src/media/registry.ts`
- Create: `src/media/r2.ts`
- Create: `scripts/sync-media.ts`
- Create: `tests/unit/media-registry.test.ts`
- Create: `tests/unit/r2.test.ts`

**Interfaces:**
- Produces: `buildRealmMediaRegistry(parsedBackend): RealmMediaRegistration[]`.
- Produces: `createR2Client(env): S3Client` configured with R2 endpoint and `region: "auto"`.
- Produces: `syncMedia({ dryRun: true|false })`.

- [ ] **Step 1: Write coverage test for the approved backend archive**

```ts
const registry = buildRealmMediaRegistry(parsedBackendFixture);
expect(registry.filter((x) => x.availability === "AVAILABLE")).toHaveLength(55);
expect(registry.filter((x) => x.availability === "MISSING")).toHaveLength(89);
expect(registry).toHaveLength(144);
```

- [ ] **Step 2: Implement filename-to-Realm mapping**

`realm_000_*` maps to `realm-001`; `realm_054_*` maps to `realm-055`. Reject indexes below 0 or above 143.

- [ ] **Step 3: Store media metadata independently from canonical Realm text**

Record source filename, MIME `audio/mpeg`, source package, SHA-256, optional R2 key, and availability. Missing Realms get explicit `MISSING` rows.

- [ ] **Step 4: Implement R2 adapter**

Required environment variables for write mode:

```text
R2_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET
```

Endpoint must be `https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com`. Dry-run requires none of the R2 secrets.

- [ ] **Step 5: Run media sync in dry-run**

Run: `pnpm media:sync -- --dry-run`

Expected: report `55 AVAILABLE`, `89 MISSING`, `0 uploaded`.

- [ ] **Step 6: Commit**

```bash
git add src/media scripts/sync-media.ts tests/unit/media-registry.test.ts tests/unit/r2.test.ts
git commit -m "feat: add explicit Realm media registry"
```

---

### Task 9: Expose bounded tRPC read and canon-governance APIs

**Files:**
- Create: `src/api/context.ts`
- Create: `src/api/trpc.ts`
- Create: `src/api/router.ts`
- Create: `src/api/routers/atlas.ts`
- Create: `src/api/routers/traditions.ts`
- Create: `src/api/routers/gates.ts`
- Create: `src/api/routers/realms.ts`
- Create: `src/api/routers/paths.ts`
- Create: `src/api/routers/correspondences.ts`
- Create: `src/api/routers/research.ts`
- Create: `src/api/routers/claims.ts`
- Create: `src/api/routers/admin.ts`
- Modify: `src/app.ts`
- Create: `tests/integration/api-read.test.ts`
- Create: `tests/integration/api-auth.test.ts`

**Interfaces:**
- Produces API procedures:
  - `atlas.search`
  - `atlas.getDeity`
  - `traditions.list`
  - `traditions.get`
  - `gates.list`
  - `gates.get`
  - `realms.list`
  - `realms.get`
  - `paths.list`
  - `correspondences.search`
  - `research.getSources`
  - `claims.list`
  - `claims.create`
  - `claims.review`
  - `admin.auditLog`

- [ ] **Step 1: Write public-read status filter test**

Insert one `APPROVED` and one `UNDER_REVIEW` Realm. Assert `realms.list` returns only the approved one to an unauthenticated/public caller.

- [ ] **Step 2: Write admin authorization test**

A non-admin call to `claims.review` and `admin.auditLog` must return tRPC `FORBIDDEN`.

- [ ] **Step 3: Implement context and procedure tiers**

Expose `publicProcedure`, `protectedProcedure`, and `adminProcedure`. Admin identity comes from persisted roles, not a hard-coded email or owner ID.

- [ ] **Step 4: Implement read routers with explicit pagination**

Search/list procedures accept `limit` 1–100 and opaque cursor/ID where applicable. Do not return unlimited 447-record result sets by default.

- [ ] **Step 5: Implement claim governance procedures**

`claims.create` creates `DRAFT`; `claims.review` requires admin and appends a canon review/audit record.

- [ ] **Step 6: Run API tests and commit**

```bash
pnpm vitest run tests/integration/api-read.test.ts tests/integration/api-auth.test.ts
git add src/api src/app.ts tests/integration/api-*.test.ts
git commit -m "feat: expose canonical tRPC APIs"
```

---

### Task 10: Persist progression, ranks, achievements, and Realm completion

**Files:**
- Create: `src/progression/ranks.ts`
- Create: `src/progression/service.ts`
- Create: `src/api/routers/progress.ts`
- Create: `src/api/routers/achievements.ts`
- Modify: `src/api/routers/realms.ts`
- Modify: `src/api/router.ts`
- Create: `tests/unit/ranks.test.ts`
- Create: `tests/integration/progression.test.ts`

**Interfaces:**
- Produces: `calculateRank(progress, rankRules): Rank`.
- Produces: `completeRealm(userId, realmId): Promise<UserRealmProgress>`.
- Adds API procedures: `progress.get`, `progress.recordDiscovery`, `achievements.list`, `realms.complete`.

- [ ] **Step 1: Write rank-rule test from Escape Matrix source model**

Use fixture rules for Seeker → Novice → Initiate → Adept → Keeper → Guardian → Sage → Elder. Rules are loaded from canonical rank rows, not switch statements.

- [ ] **Step 2: Write Realm completion idempotency test**

Calling `completeRealm` twice for the same user/Realm must not double-count completion XP or duplicate `user_realm_progress`.

- [ ] **Step 3: Implement transactional progression service**

Realm completion updates Realm progress, aggregate user progress, achievement checks, and rank history in one transaction.

- [ ] **Step 4: Implement discovery recording**

A discovery must link the user to at least one canonical object and store created timestamp; duplicate identical discovery IDs are idempotent.

- [ ] **Step 5: Run progression tests and commit**

```bash
pnpm vitest run tests/unit/ranks.test.ts tests/integration/progression.test.ts
git add src/progression src/api tests/unit/ranks.test.ts tests/integration/progression.test.ts
git commit -m "feat: persist canonical user progression"
```

---

### Task 11: Add deterministic migration fixtures, end-to-end import verification, and CI

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `tests/integration/full-import.test.ts`
- Create: `tests/integration/role-enforcement.test.ts`
- Create: `tests/integration/search-correspondence.test.ts`
- Modify: `tests/fixtures/*`

**Interfaces:**
- CI validates build/typecheck/unit tests without needing private source archives.
- Full-source verification is an explicit local/controlled job using `SOURCE_EVIDENCE_DIR`.

- [ ] **Step 1: Build deterministic fixtures for every design-mandated edge case**

Fixtures must cover:

```text
matching Realm variants
conflicting Realm variants
missing audio
duplicate deity aliases
conflicting tradition labels
mapping claims at A/B/C/D confidence
unauthorized admin access
```

- [ ] **Step 2: Add GitHub Actions CI**

Workflow must run on pull requests and pushes to `main`:

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
```

Use a PostgreSQL 16 service container for integration tests. Do not place R2 or source-archive secrets in CI.

- [ ] **Step 3: Add controlled full-source verification test**

`tests/integration/full-import.test.ts` skips unless `SOURCE_EVIDENCE_DIR` is set. When enabled, assert all three approved hashes and minimum corpus counts before database promotion.

- [ ] **Step 4: Run the complete local suite**

```bash
pnpm check
pnpm test
pnpm build
pnpm sources:inventory
pnpm sources:import -- --dry-run
pnpm media:sync -- --dry-run
```

Expected: all commands PASS; dry-run performs zero production writes/uploads.

- [ ] **Step 5: Commit**

```bash
git add .github tests
git commit -m "test: verify canonical imports and governance in CI"
```

---

### Task 12: Align deployment documentation with the actual runtime

**Files:**
- Create: `docs/operations/CANONICAL_IMPORT_RUNBOOK.md`
- Create: `docs/operations/DEPLOYMENT.md`
- Create: `docs/operations/REALM_CONFLICT_REVIEW.md`
- Modify: `README.md`
- Modify: `.env.example`
- Create: `tests/unit/docs-config.test.ts`

**Interfaces:**
- Documentation must name PostgreSQL + R2, not MySQL + Manus/Forge or PostgreSQL + AWS S3 interchangeably.
- Stripe is explicitly marked outside Phase 1 and no payment capability is claimed.

- [ ] **Step 1: Write a docs/runtime consistency test**

```ts
const deployment = readFileSync("docs/operations/DEPLOYMENT.md", "utf8");
expect(deployment).toContain("PostgreSQL");
expect(deployment).toContain("Cloudflare R2");
expect(deployment).not.toContain("MySQL");
expect(deployment).not.toMatch(/Stripe is implemented/i);
```

- [ ] **Step 2: Write import runbook with exact operator sequence**

```bash
pnpm sources:inventory
pnpm sources:import -- --dry-run
pnpm sources:import -- --commit
pnpm media:sync -- --dry-run
pnpm media:sync -- --commit
```

The runbook must state that `--commit` is forbidden until dry-run has no hash/schema/reconciliation errors.

- [ ] **Step 3: Write Realm conflict review procedure**

Document: inspect all source variants → compare provenance → select canonical value → record rationale → admin approval → new canon version → audit record. Never delete losing variants.

- [ ] **Step 4: Run final verification**

```bash
pnpm vitest run tests/unit/docs-config.test.ts
pnpm check
pnpm test
pnpm build
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add docs README.md .env.example tests/unit/docs-config.test.ts
git commit -m "docs: align canonical deployment and import operations"
```

---

## Final Phase 1 acceptance gate

Before the implementation PR is eligible to merge, the executor must produce evidence for every statement below:

1. The three approved source archives verify against the exact SHA-256 hashes in `SOURCE_MANIFEST.json`.
2. Raw ZIP archives remain unchanged and are not present in Git history.
3. PostgreSQL schema migration completes from an empty database.
4. Exactly 12 stable Gate IDs, 12 stable Path IDs, and 144 stable Realm IDs exist after import.
5. Conflicting Realm variants remain queryable and unresolved conflicts are `UNDER_REVIEW`.
6. Deity, tradition, source/citation, correspondence, and mapping-claim records resolve through canonical IDs.
7. Public API reads exclude non-approved canon records.
8. Admin-only canon review and audit endpoints reject non-admin users.
9. Realm media registry reports 55 available source MP3s and 89 missing Realm audio entries for this source baseline.
10. User Realm completion is persistent and idempotent.
11. Rank rules are data-driven from canonical rank records.
12. `pnpm check`, `pnpm test`, and `pnpm build` all pass.
13. Deployment documentation names the actual runtime: Node 24.x + PostgreSQL 16+ + Cloudflare R2.
14. Phase 1 makes no claim that Stripe/payment capability is implemented.

## Execution order

Execute Tasks 1–12 sequentially. Tasks 1–6 establish the trust boundary and must not be parallelized because later schema/import behavior depends on earlier interfaces. After Task 6, Tasks 7 and 8 may be implemented independently, followed by Tasks 9–10. Task 11 is the release-quality gate; Task 12 is the operational truth gate.

## Self-review result

- **Spec coverage:** All Phase 1 design requirements are mapped to tasks: schema/migrations (Task 2), source preservation/provenance (Tasks 3–4), Realm reconciliation (Task 5), canon governance/versioning (Task 6), knowledge import (Task 7), explicit media state (Task 8), bounded read/governance APIs (Task 9), server-side progression (Task 10), migration/testing/authorization fixtures (Task 11), and runtime-documentation alignment (Task 12).
- **Placeholder scan:** No `TBD`, `TODO`, “implement later,” or undefined generic error-handling steps remain.
- **Type/interface consistency:** Stable structural IDs, canon statuses, media availability, mapping types/confidence, and procedure names are defined once and reused consistently across later tasks.
- **Scope:** No visual redesign, payment integration, social layer, or AI-agent layer is included in this Phase 1 implementation plan.
