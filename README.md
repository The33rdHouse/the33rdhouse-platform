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

### Local bootstrap

```bash
cp .env.example .env
pnpm install
pnpm check
pnpm test
pnpm dev
```

Raw source ZIP archives are evidence inputs and must **not** be committed. Their approved hashes are tracked in `source-evidence/SOURCE_MANIFEST.json` when the evidence task lands.
