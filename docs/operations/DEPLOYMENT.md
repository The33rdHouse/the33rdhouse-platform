# Canonical Content Core Deployment

## Status

Phase 1 is a canonical knowledge and progression service. It is **not** approved for public production exposure until the merge and internet-hardening gates in PR #13 are cleared.

## Authoritative runtime

The Phase 1 runtime is:

- Node.js 24.x + TypeScript
- Express 5 + tRPC 11
- PostgreSQL 16+ via Drizzle ORM
- Cloudflare R2 through its S3-compatible API for media objects
- Vitest for unit and integration verification

PostgreSQL is the canonical Phase 1 database. Cloudflare R2 is the selected Phase 1 media store and is accessed through the S3-compatible client library.

## Phase boundary

Stripe and payment processing are outside Phase 1. This service must not be described or deployed as if payment capability is implemented by the canonical core.

Visual redesign, social/community features, and speculative AI-agent functionality are also outside Phase 1.

## Required environment

```text
DATABASE_URL=postgresql://...
PORT=3000
SOURCE_EVIDENCE_DIR=/secure/path/to/source-evidence
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=...
```

R2 variables are required only for media commit mode. Secrets must be supplied by the deployment platform's secret manager or environment configuration and must never be committed to Git.

Raw source ZIP archives must remain outside Git and are not application deployment artifacts.

## Build and verification gate

A deployable revision must pass:

```bash
pnpm install --frozen-lockfile
pnpm db:generate
git diff --exit-code -- drizzle
pnpm check
pnpm db:migrate
pnpm test
pnpm build
```

The database migration must be proven against PostgreSQL 16 before deployment promotion.

## HTTP surface

The current application exposes:

- `GET /health`
- tRPC under `/trpc`

`X-Powered-By` is disabled and JSON request bodies are capped by the application.

### Console authentication integration

The HARMGA integration installs database-backed opaque-session authentication before tRPC. Protected procedures still resolve identity through `res.locals.authUserId` and persisted roles. Client identity headers are not trusted. Operator-issued, expiring pilot sessions and same-origin mutation enforcement are described in `HARMGA_CONSOLE.md`.

The console adds POST /auth/session, POST /auth/logout, protected GET /api/exhibits/:id, console tRPC procedures and the built frontend. Configure APP_ORIGIN and NODE_ENV=production before deployment. Pilot credential issuance is not a replacement for an approved broad-rollout identity provider. Production readiness remains subject to the gates below.

## Internet-facing hardening gate

Before exposing the service publicly, the deployment must explicitly provide and test all of the following either at the application layer or a controlled ingress layer:

- rate limiting;
- explicit CORS policy;
- HTTP security headers / CSP as applicable;
- trusted-proxy configuration appropriate to the hosting topology;
- TLS/HTTPS enforcement at ingress;
- structured request/error logging with correlation identifiers;
- production error responses that do not leak stack traces or secrets;
- request-size and timeout policy;
- secret rotation and least-privilege credentials;
- database and R2 network/access policy.

Do not infer these controls merely from CI success.

## Source import

Source import is an operator workflow, not an automatic deploy hook. Follow `CANONICAL_IMPORT_RUNBOOK.md`. Commit mode is forbidden until the corresponding dry-run is clean.

## Canon governance

Published reads may expose only approved canonical records. Administrative review/rejection must remain role-enforced and auditable. Conflicting source variants are retained and reviewed through `REALM_CONFLICT_REVIEW.md`; they are not normalized silently during deployment.

## Promotion rule

A deployment may be promoted only when:

1. current `main` has been reconciled into the release branch;
2. the repository-authority decision is consistent across the Canonical Knowledge Platform design and the GitHub Control Register;
3. CI is green on the reconciled commit;
4. trusted authentication is wired for any protected/admin HTTP feature being exposed;
5. the internet-facing hardening gate is evidenced;
6. deployment documentation still matches the actual runtime.

