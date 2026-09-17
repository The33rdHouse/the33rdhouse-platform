# Canonical Import Runbook

## Purpose

This runbook defines the only approved operator sequence for importing the Phase 1 Canonical Content Core source baseline. Raw source archives are immutable evidence. They are verified, parsed, staged, reconciled, and promoted; they are never edited to make an import pass.

## Runtime baseline

- Node.js 24.x
- PostgreSQL 16+
- Drizzle ORM / Drizzle Kit
- Cloudflare R2 for canonical media storage
- Source evidence stored outside Git

`SOURCE_EVIDENCE_DIR` must point to the directory containing the exact approved source archives named in `source-evidence/SOURCE_MANIFEST.json`.

## Approved source evidence

The import pipeline accepts only source packages that pass the manifest's exact filename, byte-size, and SHA-256 checks. A mismatch is a hard stop. Do not rename, rewrite, recompress, or otherwise alter an archive to satisfy the manifest.

## Pre-import gate

Before any commit-mode command:

1. Use an isolated PostgreSQL database first.
2. Confirm `.env` is local/secret-managed and is not tracked by Git.
3. Confirm the source archives are outside the repository and remain unchanged.
4. Run the complete CI-equivalent verification:

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
```

5. Confirm the working tree contains no raw source ZIPs or live credentials.

## Required operator sequence

Run these commands in this order:

```bash
pnpm sources:inventory
pnpm sources:import -- --dry-run
pnpm sources:import -- --commit
pnpm media:sync -- --dry-run
pnpm media:sync -- --commit
```

### 1. Inventory

```bash
pnpm sources:inventory
```

The inventory must verify every approved archive against `SOURCE_MANIFEST.json`. Stop immediately on a missing archive, filename mismatch, byte-size mismatch, SHA-256 mismatch, unsafe ZIP entry, or unreadable package.

### 2. Source import dry-run

```bash
pnpm sources:import -- --dry-run
```

Dry-run must parse and reconcile without database writes. Review all warnings and conflicts. Commit mode (`--commit`) is forbidden if dry-run reports any hash, schema, structural-ID, duplicate, referential-integrity, or reconciliation error.

An `UNDER_REVIEW` Realm conflict is not permission to choose a winner automatically. It is a governance item and must follow `REALM_CONFLICT_REVIEW.md`.

### 3. Source import commit

```bash
pnpm sources:import -- --commit
```

Use commit mode only after the dry-run is clean except for explicitly expected governance conflicts. The import pipeline must preserve source provenance and source variants. Never delete or overwrite source records to force canonical agreement.

### 4. Media sync dry-run

```bash
pnpm media:sync -- --dry-run
```

Dry-run requires no R2 credentials and must perform zero uploads. Confirm media coverage and hashes before enabling write mode.

### 5. Media sync commit

```bash
pnpm media:sync -- --commit
```

Commit mode requires `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, and `R2_BUCKET`. The media sync must re-verify the source media SHA-256 before upload.

## Fail-closed conditions

Stop the operation and do not promote canonical data if any of the following occurs:

- source hash or byte count differs from the approved manifest;
- ZIP path validation fails;
- a source schema cannot be parsed safely;
- a stable Gate, Path, or Realm identifier is duplicated or out of range;
- referential integrity fails;
- a canonical conflict is silently resolved instead of being surfaced;
- commit mode is requested before a successful dry-run;
- R2 write mode is requested without the required credentials;
- CI-equivalent typecheck, tests, or build are failing.

## Recovery

Do not repair failures by editing source evidence. Correct parser/schema/configuration defects in code, rerun tests, and repeat the full dry-run sequence. Canonical changes must use versioned governance operations so historical source records and prior canon versions remain queryable.

## Post-import verification

After a committed import, verify the Phase 1 acceptance invariants:

- 12 stable Gate IDs;
- 12 stable Path IDs;
- 144 stable Realm IDs;
- unresolved Realm disagreements remain `UNDER_REVIEW`;
- public reads expose only approved canon;
- admin governance rejects non-admin users;
- the current approved media baseline is represented explicitly rather than inferred;
- user progression operations remain persistent and idempotent;
- no raw source archive has entered Git history.

