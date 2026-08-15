# the33rdhouse-platform

Master Sovereign Platform for The 33rd House ecosystem.

## Canonical Content Core

Phase 1 implements the approved **Canonical Knowledge Platform** architecture: one canon, one backend, many experiences.

### Runtime

- Node.js 24.x + TypeScript
- PostgreSQL 16+ via Drizzle ORM
- Express + tRPC
- Cloudflare R2 through its S3-compatible API for media
- Vitest for tests

Stripe/payment capability is outside Phase 1.

### Current release status

The Phase 1 implementation remains a draft/review branch and is not approved for public production exposure until the merge, repository-authority, trusted-authentication, and internet-hardening gates documented in `docs/operations/DEPLOYMENT.md` are cleared.

### Local bootstrap

```bash
cp .env.example .env
pnpm install
pnpm check
pnpm test
pnpm dev
```

Raw source ZIP archives are immutable evidence inputs and must **not** be committed. Their approved filenames, byte sizes, and SHA-256 hashes are tracked in `source-evidence/SOURCE_MANIFEST.json`.

### Operations

- `docs/operations/CANONICAL_IMPORT_RUNBOOK.md` — required source inventory/import/media sequence and fail-closed rules.
- `docs/operations/REALM_CONFLICT_REVIEW.md` — non-destructive review procedure for conflicting canonical Realm variants.
- `docs/operations/DEPLOYMENT.md` — authoritative Phase 1 runtime and production promotion gates.

Commit-mode source import or media sync must never be run before the corresponding dry-run is clean.
